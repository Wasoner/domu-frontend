import { useState, useEffect } from 'react';
import { AppContext } from './appContextDefinition';
import { api } from '../services';

/**
 * App Context Provider
 * Global state management using React Context API
 * Handles authentication state and user data
 */

const resolveUserType = (userData) => {
  if (!userData) return 'resident';
  if (userData.userType) return userData.userType;
  if (userData.roleId === 1) return 'admin';
  if (userData.roleId === 3) return 'concierge';
  return 'resident';
};

export const AppProvider = ({ children }) => {
  // Inicializar usuario desde localStorage si existe token
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    
    if (token && userEmail) {
      return {
        email: userEmail,
        userType: userType || 'resident',
        isAuthenticated: true,
      };
    }
    return null;
  });

  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      if (api.auth.isAuthenticated()) {
        try {
          // Intentar obtener información actualizada del usuario
          const userData = await api.auth.getCurrentUser();
          if (userData) {
            setUser({
              ...userData,
              userType: resolveUserType(userData),
              isAuthenticated: true,
            });
          }
        } catch (error) {
          // Si falla, limpiar autenticación
          console.error('Error verificando autenticación:', error);
          api.auth.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Función para actualizar el usuario
  const updateUser = (userData) => {
    const normalizedUser = userData
      ? {
          ...userData,
          userType: resolveUserType(userData),
        }
      : null;

    setUser(normalizedUser);
    if (normalizedUser) {
      localStorage.setItem('userEmail', normalizedUser.email || '');
      localStorage.setItem('userType', normalizedUser.userType || 'resident');
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  const value = {
    user,
    setUser: updateUser,
    logout,
    theme,
    setTheme,
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'),
    isLoading,
    isAuthenticated: !!user && user.isAuthenticated,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
