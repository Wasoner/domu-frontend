# Domu Frontend

A modern React application built with Vite, following the latest best practices and industry-standard folder structure.

## 🚀 Features

- ⚡️ **Vite** - Lightning-fast build tool and dev server
- ⚛️ **React 19** - Latest version of React with concurrent features
- 🎨 **ESLint** - Code linting and formatting
- 📁 **Organized Structure** - Scalable folder structure following best practices
- 🔥 **Hot Module Replacement (HMR)** - Fast refresh during development

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## 🛠️ Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Wasoner/domu-frontend.git

# Navigate to project directory
cd domu-frontend

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Create production build
npm run build
```

### Preview Production Build

```bash
# Preview production build locally
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## 📁 Project Structure

```
domu-frontend/
├── public/                 # Static assets
│   └── vite.svg           # Public favicon
├── src/                    # Source code
│   ├── assets/            # Images, fonts, and other assets
│   │   └── react.svg
│   ├── components/        # Reusable UI components
│   │   ├── Button.jsx     # Example button component
│   │   └── index.js       # Component exports
│   ├── pages/             # Page components (route-level)
│   │   ├── Home.jsx       # Home page example
│   │   └── index.js       # Page exports
│   ├── hooks/             # Custom React hooks
│   │   ├── useCounter.js  # Example custom hook
│   │   └── index.js       # Hook exports
│   ├── services/          # API calls and external services
│   │   ├── api.js         # API service layer
│   │   └── index.js       # Service exports
│   ├── utils/             # Utility functions
│   │   ├── helpers.js     # Helper functions
│   │   └── index.js       # Utility exports
│   ├── context/           # React Context providers
│   │   ├── AppContext.jsx # App context provider
│   │   ├── appContextDefinition.js # Context definition
│   │   ├── useAppContext.js # Context hook
│   │   └── index.js       # Context exports
│   ├── constants/         # Application constants
│   │   └── index.js       # Constants and configuration
│   ├── styles/            # Global styles
│   │   ├── App.css        # App-level styles
│   │   └── index.css      # Global styles
│   ├── App.jsx            # Root App component
│   └── main.jsx           # Application entry point
├── .gitignore             # Git ignore rules
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── package.json           # Project dependencies and scripts
└── vite.config.js         # Vite configuration
```

## 🏗️ Folder Structure Guidelines

### `/src/components`
Reusable UI components that can be used across multiple pages. Each component should be self-contained and follow the single responsibility principle.

**Example:**
```javascript
import { Button } from './components';
```

### `/src/pages`
Page-level components that represent entire routes/views in your application. These typically compose multiple components.

**Example:**
```javascript
import { Home } from './pages';
```

### `/src/hooks`
Custom React hooks for reusable stateful logic. Follow the `use` prefix naming convention.

**Example:**
```javascript
import { useCounter } from './hooks';
```

### `/src/services`
API calls, external service integrations, and data fetching logic. Keeps API logic separate from components.

**Example:**
```javascript
import { api } from './services';
const data = await api.get('/users');
```

### `/src/utils`
Pure utility functions and helpers that don't depend on React. These should be framework-agnostic.

**Example:**
```javascript
import { formatDate, debounce } from './utils';
```

### `/src/context`
React Context providers for global state management. Alternative to state management libraries for simpler needs.

**Example:**
```javascript
import { AppProvider, useAppContext } from './context';
```

### `/src/constants`
Application-wide constants, configuration values, and enums.

**Example:**
```javascript
import { API_ENDPOINTS, ROUTES } from './constants';
```

### `/src/styles`
Global CSS files and style utilities. Component-specific styles can be co-located with components.

### `/src/assets`
Static assets like images, fonts, and icons that are imported in components.

## 🎯 Best Practices

1. **Component Organization**: Keep components small and focused on a single responsibility
2. **Named Exports**: Use named exports with index files for cleaner imports
3. **File Naming**: Use PascalCase for component files, camelCase for utilities and hooks
4. **Prop Types**: Consider adding PropTypes or TypeScript for type safety
5. **Code Splitting**: Use React.lazy() for route-based code splitting when needed
6. **State Management**: Use Context API for simple state, consider Redux/Zustand for complex state
7. **CSS Modules**: Consider using CSS Modules or styled-components for component-scoped styles

## 🔧 Technology Stack

- **React 19.1** - UI library
- **Vite 7.1** - Build tool and dev server
- **ESLint 9.36** - Code linting

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [ESLint Documentation](https://eslint.org)

## 📝 License

This project is part of "Proyecto de Titulo" (Thesis Project).

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
