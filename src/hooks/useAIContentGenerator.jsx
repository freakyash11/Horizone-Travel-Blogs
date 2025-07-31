// hooks/useAIContentGenerator.js
import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import conf from '../conf/conf';

export const useAIContentGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [prompt, setPrompt] = useState('');

  let genAI;
  try {
    genAI = new GoogleGenerativeAI(conf.geminiApiKey);
  } catch (error) {
    console.error('Error initializing Gemini AI:', error);
  }

  const generateContent = async (editorInstance) => {
    if (!prompt.trim()) {
      alert('Please enter a prompt for content generation');
      return;
    }

    if (!genAI) {
      alert('Failed to initialize AI model. Please check your API configuration.');
      return;
    }

    // Validate API key
    if (!conf.geminiApiKey || 
        conf.geminiApiKey === 'undefined' || 
        conf.geminiApiKey.length < 10) {
      alert('Invalid Gemini API key. Please check your configuration.');
      return;
    }

    setIsGenerating(true);
    try {
      // Try different model names in order of preference
      const modelNames = ["gemini-2.0-flash-lite","gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
      let model;
      let modelUsed;

      for (const modelName of modelNames) {
        try {
          model = genAI.getGenerativeModel({ model: modelName });
          modelUsed = modelName;
          console.log(`Using model: ${modelName}`);
          break;
        } catch (modelError) {
          console.warn(`Model ${modelName} not available:`, modelError.message);
          continue;
        }
      }

      if (!model) {
        throw new Error('No available Gemini model found. Please check your API key permissions.');
      }
      
      const enhancedPrompt = `Generate a high-quality blog content for the following topic. 
      Requirements:
      - Maximum length: 600 words
      - Make it engaging, well-structured with proper headings, and informative
      - Format it in clean HTML with proper heading tags (h2, h3), paragraphs, and lists where appropriate
      - Include a brief introduction and conclusion
      - Focus on key points and maintain concise paragraphs
      
      Topic: ${prompt}
      
      Important: The content MUST NOT exceed 600 words while maintaining quality and coherence.`;

      console.log(`Sending request to Gemini API using ${modelUsed}...`);
      
      // For newer models, use generateContent instead of chat
      let result;
      if (modelUsed.includes('1.5')) {
        // Use the newer generateContent method
        result = await model.generateContent({
          contents: [{ parts: [{ text: enhancedPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        });
      } else {
        // Use the older chat method for gemini-pro
        const chat = model.startChat({
          history: [],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        });
        result = await chat.sendMessage(enhancedPrompt);
      }

      const response = result.response;
      
      if (!response) {
        throw new Error('No response received from the API');
      }

      const generatedContent = response.text();
      if (!generatedContent) {
        throw new Error('Empty content received from the API');
      }

      console.log('Generated content received:', generatedContent.substring(0, 100) + '...');

      // Count words in the generated content (excluding HTML tags)
      const wordCount = generatedContent
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .split(/\s+/)
        .filter(word => word.length > 0)
        .length;

      console.log('Generated content word count:', wordCount);

      if (wordCount > 600) {
        throw new Error(`Generated content exceeds 600 words (current: ${wordCount} words). Requesting new generation.`);
      }

      // Clean up the generated content to remove markdown syntax and ensure proper HTML
      const cleanContent = generatedContent
        .replace(/```html/g, '')
        .replace(/```/g, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .trim();

      // Insert the generated content into TinyMCE editor
      if (editorInstance) {
        const currentContent = editorInstance.getContent();
        const newContent = currentContent + (currentContent ? '<br><br>' : '') + cleanContent;
        editorInstance.setContent(newContent);
      }

      setShowAIModal(false);
      setPrompt('');
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.details || error.response?.data,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to generate content. ';
      
      // Handle specific Gemini API errors
      if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
        errorMessage += 'Invalid API key provided.';
      } else if (error.message?.includes('quota') || error.status === 429) {
        errorMessage += 'API quota exceeded. Please try again later.';
      } else if (error.message?.includes('blocked')) {
        errorMessage += 'Content was blocked by safety filters. Try rephrasing your prompt.';
      } else if (error.message?.includes('not found') || error.status === 404) {
        errorMessage += 'Model not found. Your API key may not have access to Gemini models.';
      } else if (error.status === 403) {
        errorMessage += 'API key doesn\'t have permission. Please check your Google AI Studio settings.';
      } else if (error.message?.includes('PERMISSION_DENIED')) {
        errorMessage += 'Permission denied. Please enable the Generative AI API in Google Cloud Console.';
      } else if (error.message?.includes('exceeds 600 words')) {
        errorMessage += 'The generated content was too long. Please try again for a more concise response.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    showAIModal,
    setShowAIModal,
    prompt,
    setPrompt,
    generateContent
  };
};