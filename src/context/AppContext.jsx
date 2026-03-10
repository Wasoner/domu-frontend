import { useState, useEffect, useCallback } from 'react';
import { AppContext } from './appContextDefinition';
import { api } from '../services';

const resolveUserType = (userData) => {
  if (!userData) return 'resident';
  if (userData.userType) return userData.userType;
  if (userData.roleId === 1) return 'admin';
  if (userData.roleId === 3) return 'concierge';
  if (userData.roleId === 4) return 'staff';
  return 'resident';
};

export const AppProvider = ({ children }) => {
  // Inicializar usuario desde localStorage si existe token
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    const selectedBuildingId = localStorage.getItem('selectedBuildingId');

    if (token && userEmail) {
      let permissions = [];
      try { permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]'); } catch { /* empty */ }
      return {
        email: userEmail,
        userType: userType || 'resident',
        isAuthenticated: true,
        selectedBuildingId: selectedBuildingId ? Number(selectedBuildingId) : undefined,
        permissions,
      };
    }
    return null;
  });

  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('authToken'));
  // Contador para detectar cambios de edificio y forzar recarga de datos
  const [buildingVersion, setBuildingVersion] = useState(0);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      if (api.auth.isAuthenticated()) {
        try {
          // Intentar obtener información actualizada del usuario
          const userData = await api.auth.getCurrentUser();
          if (userData) {
            // Determinar el buildingId a usar (validar contra buildings)
            const storedBuildingId = localStorage.getItem('selectedBuildingId');
            const storedBuildingNum = storedBuildingId ? Number(storedBuildingId) : undefined;
            const buildingIds = (userData.buildings || []).map((b) => b.id);
            const hasStoredBuilding = storedBuildingNum !== undefined && buildingIds.includes(storedBuildingNum);
            const fallbackBuildingId = userData.activeBuildingId ?? userData.buildings?.[0]?.id;
            const buildingId = hasStoredBuilding ? storedBuildingNum : fallbackBuildingId;

            // Guardar en localStorage si no estaba o si era inválido (permitir 0 como válido)
            if (buildingId !== undefined && buildingId !== null && (!storedBuildingId || !hasStoredBuilding)) {
              localStorage.setItem('selectedBuildingId', buildingId);
            }

            if (userData.permissions) {
              localStorage.setItem('userPermissions', JSON.stringify(userData.permissions));
            }
            setUser({
              ...userData,
              userType: resolveUserType(userData),
              isAuthenticated: true,
              selectedBuildingId: buildingId,
              permissions: userData.permissions || [],
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
    const storedBuildingId = localStorage.getItem('selectedBuildingId');
    const storedBuildingNum = storedBuildingId ? Number(storedBuildingId) : undefined;
    const buildingIds = (userData?.buildings || []).map((b) => b.id);
    const hasStoredBuilding = storedBuildingNum !== undefined && buildingIds.includes(storedBuildingNum);

    const resolvedBuildingId = userData
      ? (
        (hasStoredBuilding ? storedBuildingNum : undefined) ??
        userData.selectedBuildingId ??
        userData.activeBuildingId ??
        user?.selectedBuildingId ??
        userData.buildings?.[0]?.id
      )
      : undefined;

    const normalizedUser = userData
      ? {
        ...userData,
        userType: resolveUserType(userData),
        isAuthenticated: true,
        selectedBuildingId: resolvedBuildingId,
        permissions: userData.permissions || [],
      }
      : null;

    setUser(normalizedUser);
    if (normalizedUser) {
      localStorage.setItem('userEmail', normalizedUser.email || '');
      localStorage.setItem('userType', normalizedUser.userType || 'resident');
      if (normalizedUser.permissions) {
        localStorage.setItem('userPermissions', JSON.stringify(normalizedUser.permissions));
      }
      if (normalizedUser.selectedBuildingId !== undefined && normalizedUser.selectedBuildingId !== null) {
        localStorage.setItem('selectedBuildingId', normalizedUser.selectedBuildingId);
      }
    }
  };

  const selectBuilding = (buildingId) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, selectedBuildingId: buildingId };
      localStorage.setItem('selectedBuildingId', buildingId ?? '');
      return next;
    });
    // Incrementar versión para que los componentes detecten el cambio y recarguen datos
    setBuildingVersion((v) => v + 1);
  };

  // Función para cerrar sesión
  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  const hasPermission = useCallback((perm) => {
    const perms = user?.permissions || [];
    return perms.includes('ALL') || perms.includes(perm);
  }, [user?.permissions]);

  const value = {
    user,
    setUser: updateUser,
    selectBuilding,
    buildingVersion,
    logout,
    hasPermission,
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
