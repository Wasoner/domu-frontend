# Buenas Prácticas - Proyecto Domu

## 📝 Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase (`Button.jsx`, `FeatureCard.jsx`)
- **Hooks**: camelCase con prefijo `use` (`useCounter.js`, `useAuth.js`)
- **Utilidades**: camelCase (`helpers.js`, `utils.js`)
- **Constantes**: UPPER_SNAKE_CASE en constantes globales

### Estructura de Archivos
```
src/
├── components/    # Componentes reutilizables
├── pages/         # Páginas completas
├── services/      # Servicios API
├── context/       # Context providers
├── constants/     # Constantes
└── styles/        # Estilos globales
```

## ✅ Checklist de Componentes

### Al crear un componente nuevo:
- [ ] Agregar PropTypes para validación de props
- [ ] Incluir comentario JSDoc con descripción
- [ ] Exportar en `index.js` correspondiente
- [ ] Usar nombres descriptivos y en español para props y funciones
- [ ] Evitar importar React innecesariamente (React 17+)

### Ejemplo de componente bien estructurado:

```jsx
import PropTypes from 'prop-types';

/**
 * Component description
 * @param {Object} props - Component props
 */
const MyComponent = ({ title, children, variant = 'default' }) => {
  return (
    <div className={`my-component my-component--${variant}`}>
      <h3>{title}</h3>
      {children}
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary']),
};

export default MyComponent;
```

## 🧩 Catálogo de Componentes Base

### Button (`src/components/Button.jsx`)
Botón reutilizable con variantes y tamaños.

```jsx
import { Button } from './components';

<Button 
  variant="primary" // primary, secondary, ghost, danger
  size="default"    // small, default, large
  onClick={handler}
  disabled={isLoading}
>
  Guardar cambios
</Button>
```

### FormField (`src/components/FormField.jsx`)
Wrapper para inputs que maneja labels, errores y hints automáticamente.

```jsx
import { FormField } from './components';

<FormField
  label="Correo electrónico"
  name="email"
  type="email"
  hint="Usaremos este correo para contactarte"
  error={errors.email} // Muestra mensaje de error si existe
  onChange={handleChange}
/>
```

## 🎯 Estándares de Código

### Variables y Funciones
- Usar nombres descriptivos en español para lógica de negocio
- Usar nombres técnicos en inglés para código genérico
- Variables: camelCase
- Constantes: UPPER_SNAKE_CASE

```javascript
// ✅ Bueno
const gastosComunes = [...];
const calcularTotal = () => { ... };

// ❌ Malo
const gst = [...];
const calc = () => { ... };
```

### Funciones
- Prefijo `handle` para event handlers
- Prefijo `on` para props de callbacks
- Nombres descriptivos

```javascript
// ✅ Bueno
const handleSubmit = () => { ... };
const handleResidentLogin = () => { ... };

// ❌ Malo
const click = () => { ... };
const onSubmit = () => { ... };
```

## 🔒 Estado y Props

### useState
- Agrupar estado relacionado en objetos
- Usar funciones setter para actualizaciones complejas

```javascript
// ✅ Bueno
const [user, setUser] = useState({ email: '', password: '' });
setUser(prev => ({ ...prev, email: 'nuevo@email.com' }));

// ❌ Malo
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

### PropTypes
- Siempre validar props con PropTypes
- Usar `isRequired` cuando corresponda
- Definir valores por defecto cuando sea apropiado

## 🎨 Estilos

### CSS
- Usar CSS Modules para estilos de componente
- Variables CSS para colores y valores reutilizables
- Clases con BEM (Block Element Modifier) cuando sea apropiado
- Evitar estilos inline para estilos complejos

### Responsive Design
- Mobile First approach
- Breakpoints estándar:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🚀 Rendimiento

### Optimizaciones
- Usar `React.memo()` para componentes costosos
- Implementar lazy loading con `React.lazy()`
- Code splitting por rutas
- Optimizar imágenes (WebP, lazy loading)

### Re-renders
- Evitar crear objetos/funciones en el render
- Usar `useCallback` y `useMemo` cuando sea necesario

## 📱 Accesibilidad

### Elementos Interactivos
- Siempre usar elementos semánticos correctos
- Agregar `aria-label` cuando sea necesario
- Asegurar navegación por teclado

```jsx
// ✅ Bueno
<button onClick={handler} aria-label="Cerrar sesión">
  Cerrar sesión
</button>

// ❌ Malo
<div onClick={handler}>Cerrar sesión</div>
```

## 🧪 Testing (Próximamente)

### Escribir tests para:
- Componentes críticos
- Hooks personalizados
- Funciones utilitarias
- Servicios API

### Naming convention para tests
```
MyComponent.test.js
useAuth.test.js
helpers.test.js
```

## 📦 Imports

### Orden de imports
1. Librerías externas (React, React Router, etc.)
2. Imports internos absolutos (componentes, hooks)
3. Imports relativos (./, ../)
4. Tipos (si se usa TypeScript)

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components';
import { useAppContext } from '../../context';

import './MyComponent.css';
```

## 🔄 Git Workflow

### Commits
- Mensajes descriptivos en español
- Prefijos: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`

### Branches
- `main` - Producción
- `develop` - Desarrollo
- `feature/nombre` - Nuevas funcionalidades
- `fix/nombre` - Correcciones de bugs

## 📚 Documentación

### Comentarios
- Explicar el "por qué", no el "qué"
- Usar JSDoc para funciones y componentes
- Eliminar comentarios obsoletos

### README
- Mantener actualizado
- Incluir instrucciones de instalación
- Documentar variables de entorno
- Incluir capturas de pantalla cuando sea relevante

## 🛡️ Seguridad

### Validación
- Validar todos los inputs del usuario
- Sanitizar datos antes de enviar a API
- Usar HTTPS en producción
- No exponer tokens en el código

### Autenticación
- Usar tokens seguros
- Implementar refresh tokens
- Validar roles y permisos en cada ruta protegida

## ⚠️ Errores Comunes a Evitar

1. **Modificar props directamente** ❌
   ```javascript
   // Mal
   props.user.name = 'Nuevo nombre';
   
   // Bien
   const updatedUser = { ...props.user, name: 'Nuevo nombre' };
   ```

2. **No manejar estados de carga** ❌
   - Siempre mostrar loading states
   - Manejar errores apropiadamente

3. **Duplicar lógica** ❌
   - Extraer lógica común a hooks o utilidades

4. **Ignorar ESLint** ❌
   - Arreglar warnings y errors antes de commit

## 🎓 Recursos

- [React Best Practices](https://react.dev/learn)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 📞 Contacto

Para dudas sobre las prácticas del proyecto, consultar el documento PLAN_PLATAFORMA.md

