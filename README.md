# Horizone Travel Blog

A modern, adventure-focused travel blog built with React, Tailwind CSS, and Appwrite.

## Features

- **Responsive Design**: Fully responsive design that works on mobile, tablet, and desktop
- **Dark Mode**: Support for light and dark mode with user preference detection
- **Animations**: Smooth animations and transitions for a better user experience
- **Accessibility**: Semantic HTML, keyboard navigation, and ARIA attributes
- **SEO Optimized**: Meta tags and structured data for better search engine visibility
- **Performance**: Optimized images, code splitting, and lazy loading
- **User Statistics**: Display of total registered users and article counts

## Design System

The design system is based on the Horizone Travel Design System, which includes:

- **Color Palette**: A carefully crafted color palette for both light and dark modes
- **Typography**: A consistent typography system using Inter font family
- **Spacing**: Consistent spacing using a base-8 system
- **Components**: Reusable components like buttons, cards, and navigation
- **Animations**: Subtle animations and transitions for a better user experience

## Technologies Used

- **React**: Frontend library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Appwrite**: Backend as a service for authentication and data storage
- **React Router**: For routing and navigation
- **Redux Toolkit**: For state management
- **Express.js**: Backend server for secure API endpoints

## Getting Started

### Frontend Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:5173](http://localhost:5173) in your browser

### API Server Setup

The project includes an API server for secure access to Appwrite resources:

1. Navigate to the API directory: `cd api`
2. Install dependencies: `npm install`
3. Create a `.env` file with your Appwrite credentials (see `api/README.md`)
4. Start the API server: `npm run dev`
5. API server will run on [http://localhost:3000](http://localhost:3000)

For more detailed instructions, see the [API README](./api/README.md).

## Project Structure

```
src/
  ├── appwrite/        # Appwrite configuration and API calls
  ├── assets/          # Static assets like images and icons
  ├── components/      # Reusable components
  ├── conf/            # Configuration files
  ├── pages/           # Page components
  ├── store/           # Redux store and slices
  ├── theme/           # Theme configuration
  ├── utils/           # Utility functions
  ├── App.jsx          # Main App component
  └── main.jsx         # Entry point

api/
  ├── functions/       # API functions (user count, etc.)
  ├── server.js        # Express server setup
  └── package.json     # API server dependencies
```

## Design Implementation

The design implementation is based on the `design.json` file, which contains the complete visual specifications for the project. The design tokens have been extracted into the Tailwind configuration for consistent usage across the application.

## Accessibility Features

- Semantic HTML elements
- ARIA attributes for interactive elements
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly content

## Performance Optimizations

- Lazy loading of images
- Code splitting for better load times
- Optimized bundle size
- Efficient rendering with React

## License

This project is licensed under the MIT License - see the LICENSE file for details.
