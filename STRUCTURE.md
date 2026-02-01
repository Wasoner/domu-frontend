# Project Structure Guide

This document provides detailed information about the folder structure and architecture decisions.

## Architecture Overview

This React application follows a **feature-based structure** with clear separation of concerns:

```
Frontend Architecture
├── Presentation Layer (Components, Pages)
├── Business Logic Layer (Context)
├── Service Layer (API, Services)
└── Utilities Layer (Constants)
```

## Directory Deep Dive

### 📦 `/src/components`
**Purpose**: Reusable, presentational components

**Characteristics**:
- Should be **pure** or have minimal side effects
- Accept props for configuration
- Focus on UI rendering
- Can be used across multiple pages

**Example Usage**:
```jsx
import { Button } from './components';

function MyPage() {
  return <Button onClick={handleClick}>Click me</Button>;
}
```

**Naming Convention**: PascalCase (e.g., `Button.jsx`, `UserCard.jsx`)

---

### 📄 `/src/pages`
**Purpose**: Route-level components that represent full pages

**Characteristics**:
- Compose multiple components
- Handle page-level logic
- Connect to services and context
- Typically map to routes in your router

**Example Usage**:
```jsx
import { Home } from './pages';
// Used in router: <Route path="/" element={<Home />} />
```

**Naming Convention**: PascalCase (e.g., `Home.jsx`, `Dashboard.jsx`)

---

### 🌐 `/src/services`
**Purpose**: API calls and external service integrations

**Characteristics**:
- Centralized data fetching
- Error handling
- Request/response transformation
- Framework-agnostic

**Available Modules (`api.js`)**:
- **auth**: `login`, `logout`, `register`, `getCurrentUser`
- **finance**: `getMyCharges`, `listPeriods`, `createPeriod`, `addCharges`, `uploadChargeReceipt`
- **buildings**: `createRequest` (Registration)
- **visits**: `create`, `listMine`, `checkIn`, `contacts` (management)
- **incidents**: `listMine`, `create`, `updateStatus`
- **polls**: `list`, `create`, `vote`, `close`, `exportCsv`
- **amenities**: `list`, `getAvailability`, `reserve`, `configureTimeSlots`
- **housingUnits**: `list`, `create`, `linkResident`
- **users**: `updateProfile`, `changePassword`

**Example Usage**:
```jsx
import { api } from './services';

async function fetchUsers() {
  const users = await api.get('/users');
  return users;
}
```

**Naming Convention**: camelCase (e.g., `api.js`, `authService.js`)

---

### 🌍 `/src/context`
**Purpose**: Global state management using React Context API

**Characteristics**:
- Share state across component tree
- Alternative to prop drilling
- Best for simple to medium complexity state
- Consider Redux/Zustand for complex state

**Example Usage**:
```jsx
import { AppProvider, useAppContext } from './context';

// Wrap your app
<AppProvider>
  <App />
</AppProvider>

// Use in components
function Component() {
  const { user, theme } = useAppContext();
  return <div>Hello {user?.name}</div>;
}
```

**Naming Convention**: PascalCase for providers, camelCase for hooks

---

### 📋 `/src/constants`
**Purpose**: Application-wide constants and configuration

**Characteristics**:
- Immutable values
- Shared across the app
- Type-safe configuration
- Easy to maintain

**Example Usage**:
```jsx
import { API_ENDPOINTS, ROUTES, THEME } from './constants';

fetch(`${API_ENDPOINTS.USERS}`);
navigate(ROUTES.HOME);
```

**Naming Convention**: UPPER_SNAKE_CASE for constants, camelCase for files

---

### 🎨 `/src/styles`
**Purpose**: Global styles and CSS utilities

**Current Setup**: Plain CSS
**Alternatives**: 
- CSS Modules
- Styled Components
- Tailwind CSS
- Emotion
- Sass/SCSS

---

### 🖼️ `/src/assets`
**Purpose**: Static files imported in components

**Contents**:
- Images
- Fonts
- Icons
- SVG files

---

## Best Practices

### Import Organization
```jsx
// 1. External libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal modules (absolute imports)
import { Button } from './components';
import { useCounter } from './hooks';
import { api } from './services';

// 3. Relative imports
import './styles/App.css';
```

### Component Structure
```jsx
// 1. Imports
import { useState } from 'react';
import { Button } from '../components';

// 2. Component definition
const MyComponent = ({ prop1, prop2 }) => {
  // 3. Hooks
  const [state, setState] = useState(null);
  
  // 4. Handlers
  const handleClick = () => {
    // logic
  };
  
  // 5. Effects
  useEffect(() => {
    // side effects
  }, []);
  
  // 6. Render
  return (
    <div>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
};

// 7. Export
export default MyComponent;
```

### File Naming
- Components: `PascalCase.jsx` (e.g., `UserProfile.jsx`)
- Hooks: `useCamelCase.js` (e.g., `useFetch.js`)
- Utils: `camelCase.js` (e.g., `formatters.js`)
- Constants: `camelCase.js` or `CONSTANTS.js`

## Scaling the Structure

As your app grows, consider:

### 1. Feature-Based Organization
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   ├── dashboard/
│   └── users/
```

### 2. Add TypeScript
- Better type safety
- Improved developer experience
- Self-documenting code

### 3. Add State Management
- Redux Toolkit (complex state)
- Zustand (simpler alternative)
- Jotai (atomic state)
- Recoil (experimental)

### 4. Add Routing
```bash
npm install react-router-dom
```

### 5. Add Testing
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Quick Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Create production build
npm run preview      # Preview production build

# Quality
npm run lint         # Run ESLint
```

## Additional Resources

- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Vite Guide](https://vite.dev/guide/)
- [Project Structure Patterns](https://blog.webdevsimplified.com/2022-07/react-folder-structure/)
