import React from 'react'
import { Editor } from '@tinymce/tinymce-react';
import { Controller } from 'react-hook-form';
import appwriteService from "../appwrite/config";
import { ID } from 'appwrite';
import conf from '../conf/conf';

export default function RTE({ name, control, label, defaultValue = "", onChange }) {
  // Function to handle image upload
  const handleImageUpload = async (blobInfo) => {
    try {
      const file = blobInfo.blob();
      const fileUpload = await appwriteService.uploadFile(file);
      
      if (fileUpload) {
        // Generate direct URL from Appwrite
        const fileUrl = `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${fileUpload.$id}/view?project=${conf.appwriteProjectId}`;
        console.log('Uploaded image URL:', fileUrl); // Debug log
        return fileUrl;
      }
      throw new Error('Failed to upload image');
    } catch (error) {
      console.error('Image upload failed:', error);
      // Show more detailed error message
      const errorMessage = error.message || 'Image upload failed';
      console.log('Upload error details:', {
        message: errorMessage,
        response: error.response,
        code: error.code
      });
      return Promise.reject({ message: errorMessage, remove: true });
    }
  };

  return (
    <div className='w-full'> 
      {label && <label className='inline-block mb-1 pl-1'>{label}</label>}

      <Controller
        name={name || "content"}
        control={control}
        render={({ field: { onChange: fieldOnChange, value } }) => (
          <Editor
            apiKey={conf.tinymceApiKey} // Add your API key in conf.js
            initialValue={defaultValue}
            value={value}
            init={{
              height: 500,
              menubar: true,
              branding: false,
              resize: true,
              statusbar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                'emoticons', 'codesample', 'hr', 'pagebreak', 'nonbreaking', 'toc'
              ],
              toolbar: 'undo redo | formatselect | ' +
                'bold italic underline strikethrough | forecolor backcolor | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | link image media | ' +
                'removeformat codesample emoticons | help',
              content_style: `
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #333;
                  max-width: 100%;
                }
                img { max-width: 100%; height: auto; }
                p { margin: 0 0 1em; }
                h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
                ul, ol { margin-bottom: 1em; padding-left: 2em; }
                blockquote { 
                  margin-left: 0;
                  padding-left: 1em;
                  border-left: 4px solid #ccc;
                  font-style: italic;
                }
                pre { background-color: #f5f5f5; padding: 1em; border-radius: 4px; }
              `,
              // Image upload handling
              images_upload_handler: handleImageUpload,
              file_picker_types: 'image',
              automatic_uploads: true,
              image_advtab: true,
              image_caption: true,
              // Additional image settings
              image_dimensions: true,
              image_class_list: [
                { title: 'Responsive', value: 'img-fluid' },
                { title: 'Full Width', value: 'w-full' }
              ],
              images_reuse_filename: true,
              images_upload_credentials: true,
              images_upload_base_path: `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/`,
              // Other useful settings
              paste_data_images: true,
              smart_paste: true,
              link_context_toolbar: true,
              link_title: false,
              target_list: [
                { title: 'None', value: '' },
                { title: 'New window', value: '_blank' }
              ],
              // Category-specific styles
              style_formats: [
                { title: 'Headers', items: [
                  { title: 'Header 1', format: 'h1' },
                  { title: 'Header 2', format: 'h2' },
                  { title: 'Header 3', format: 'h3' },
                  { title: 'Header 4', format: 'h4' },
                  { title: 'Header 5', format: 'h5' },
                  { title: 'Header 6', format: 'h6' }
                ]},
                { title: 'Inline', items: [
                  { title: 'Bold', format: 'bold' },
                  { title: 'Italic', format: 'italic' },
                  { title: 'Underline', format: 'underline' },
                  { title: 'Strikethrough', format: 'strikethrough' },
                  { title: 'Code', format: 'code' }
                ]},
                { title: 'Blocks', items: [
                  { title: 'Paragraph', format: 'p' },
                  { title: 'Blockquote', format: 'blockquote' },
                  { title: 'Div', format: 'div' },
                  { title: 'Pre', format: 'pre' }
                ]},
                { title: 'Travel Blog', items: [
                  { title: 'Destination Highlight', block: 'div', classes: 'destination-highlight', wrapper: true },
                  { title: 'Travel Tip', block: 'div', classes: 'travel-tip', wrapper: true },
                  { title: 'Food Review', block: 'div', classes: 'food-review', wrapper: true },
                  { title: 'Itinerary', block: 'div', classes: 'itinerary', wrapper: true }
                ]}
              ],
              // Add custom CSS for the editor
              content_css: [
                'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
              ],
              setup: (editor) => {
                editor.on('init', () => {
                  // Add custom CSS to the editor
                  editor.dom.addStyle(`
                    .destination-highlight {
                      background-color: #f0f7ff;
                      border-left: 4px solid #3498db;
                      padding: 15px;
                      margin: 15px 0;
                    }
                    .travel-tip {
                      background-color: #f9f9e0;
                      border-left: 4px solid #f1c40f;
                      padding: 15px;
                      margin: 15px 0;
                    }
                    .food-review {
                      background-color: #fff0f0;
                      border-left: 4px solid #e74c3c;
                      padding: 15px;
                      margin: 15px 0;
                    }
                    .itinerary {
                      background-color: #f0fff0;
                      border-left: 4px solid #2ecc71;
                      padding: 15px;
                      margin: 15px 0;
                    }
                  `);
                });
              }
            }}
            onEditorChange={(content) => {
              fieldOnChange(content);
              if (onChange) onChange(content);
            }}
          />
        )}
      />
    </div>
  )
}

