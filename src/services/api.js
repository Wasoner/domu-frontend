/**
 * API Service
 * Centralized API communication layer
 * Handles HTTP requests and authentication
 */

// Backend URL - puerto 8080 según configuración del backend
// En desarrollo, usar el proxy de Vite para evitar CORS
// En producción, usar la URL completa del backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:7000/api');

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const roleIdToUserType = (roleId) => {
  if (roleId === 1) return 'admin';
  if (roleId === 3) return 'concierge';
  return 'resident';
};

const userTypeToRoleId = (userType) => {
  if (userType === 'admin') return 1;
  if (userType === 'concierge') return 3;
  return 2;
};

/**
 * Generic fetch wrapper with error handling and authentication
 */
const fetchWrapper = async (url, options = {}) => {
  try {
    const token = getAuthToken();

    // Preparar headers - asegurar que Content-Type esté correctamente configurado
    const headers = new Headers();

    // Agregar headers del options primero
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    // Si hay body y no hay Content-Type definido, agregarlo
    if (options.body && !headers.has('Content-Type') && !headers.has('content-type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Agregar token de autenticación si existe
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Log para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      const bodyForLog = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
      console.log(`[API] ${options.method || 'GET'} ${API_BASE_URL}${url}`, {
        headers: Object.fromEntries(headers.entries()),
        body: bodyForLog,
      });
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body,
      ...(options.credentials && { credentials: options.credentials }),
    });

    // Si la respuesta no es exitosa, intentar parsear el error
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      // Manejo especial para errores de CORS
      if (response.status === 0) {
        errorMessage = 'Error de CORS: El backend no permite peticiones desde este origen. Verifica la configuración CORS del servidor.';
        console.error('[CORS Error] El backend debe permitir peticiones desde:', window.location.origin);
        console.error('[CORS Error] Backend URL:', `${API_BASE_URL}${url}`);
      }

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Si no se puede parsear el error, usar el mensaje por defecto
        if (import.meta.env.DEV) {
          console.error('[API Error] No se pudo parsear la respuesta de error:', e);
        }
      }

      throw new Error(errorMessage);
    }

    // Si la respuesta está vacía, retornar null
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    return await response.json();
  } catch (error) {
    // Mejorar mensajes de error para problemas de red/CORS
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('[Network Error] No se pudo conectar con el backend:', error);
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en ' + API_BASE_URL);
    }

    console.error('[API Error]', error);
    throw error;
  }
};

/**
 * API methods
 */
export const api = {
  // GET request
  get: (endpoint) => fetchWrapper(endpoint, { method: 'GET' }),

  // POST request
  post: (endpoint, data) => fetchWrapper(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // PUT request
  put: (endpoint, data) => fetchWrapper(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // DELETE request
  delete: (endpoint) => fetchWrapper(endpoint, { method: 'DELETE' }),

  // Authentication methods
  auth: {
    /**
     * Login - Iniciar sesión
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     */
    login: async (email, password) => {
      try {
        // El backend solo espera email y password según el formato de Postman
        const loginData = {
          email: email.trim(),
          password: password,
        };

        // Usar siempre la misma base (en dev será /api y lo manejará el proxy)
        const backendUrl = API_BASE_URL;

        const response = await fetch(`${backendUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            const text = await response.text();
            console.error('[Login Error] Respuesta del servidor:', text);
          }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();

        // Guardar token si viene en la respuesta
        if (responseData.token) {
          localStorage.setItem('authToken', responseData.token);
          localStorage.setItem('userEmail', email);
          // Determinar userType basado en roleId del usuario
          if (responseData.user && responseData.user.roleId) {
            const userType = roleIdToUserType(responseData.user.roleId);
            localStorage.setItem('userType', userType);
          }
        }

        return responseData;
      } catch (error) {
        // Limpiar datos de autenticación en caso de error
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
        throw error;
      }
    },

    /**
     * Logout - Cerrar sesión
     */
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
    },

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated: () => {
      return !!getAuthToken();
    },

    /**
     * Register - Registro de nuevo usuario
     * @param {Object} userData - Datos del usuario (nombre, apellido, email, password, userType, etc.)
     */
    register: async (userData) => {
      try {
        // Limpiar y validar datos antes de enviar
        // IMPORTANTE: unitId y roleId deben ser números según el backend
        const cleanData = {
          firstName: String(userData.firstName || '').trim(),
          lastName: String(userData.lastName || '').trim(),
          email: String(userData.email || '').trim(),
          password: String(userData.password || ''),
          phone: String(userData.phone || '').trim(),
          documentNumber: String(userData.documentNumber || '').trim(),
          birthDate: String(userData.birthDate || ''),
          resident: Boolean(userData.resident),
          // unitId debe ser un número (ID de la unidad de vivienda)
          unitId: Number(userData.unitId) || 0,
          // roleId debe ser un número (1 = admin, 2 = residente, 3 = conserje)
          roleId: userData.roleId !== undefined ? Number(userData.roleId) : userTypeToRoleId(userData.userType),
        };

        // Validar que unitId sea válido
        if (!cleanData.unitId || cleanData.unitId <= 0) {
          throw new Error('El ID de unidad debe ser un número válido. Asegúrate de que la unidad exista en la base de datos.');
        }

        if (import.meta.env.DEV) {
          console.log('[Register] Datos limpios:', cleanData);
        }

        // Usar la misma base para que el proxy de Vite maneje CORS en dev
        const backendUrl = API_BASE_URL;

        const token = getAuthToken();
        const headers = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        if (import.meta.env.DEV) {
          console.log('[Register] URL:', `${backendUrl}/auth/register`);
          console.log('[Register] Headers:', headers);
          console.log('[Register] Body (string):', JSON.stringify(cleanData));
        }

        const response = await fetch(`${backendUrl}/auth/register`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(cleanData),
        });

        // Manejar respuesta
        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            // Si el error tiene un formato específico de Javalin
            if (errorData.REQUEST_BODY && Array.isArray(errorData.REQUEST_BODY)) {
              const firstError = errorData.REQUEST_BODY[0];
              errorMessage = firstError.message || errorMessage;
              if (firstError.value) {
                console.error('[Register Error] Valor recibido por el backend:', firstError.value);
              }
            } else {
              errorMessage = errorData.message || errorData.error || errorMessage;
            }
          } catch (e) {
            // Si no se puede parsear el error
            const text = await response.text();
            console.error('[Register Error] Respuesta del servidor:', text);
          }
          throw new Error(errorMessage);
        }

        // Parsear respuesta exitosa
        const responseData = await response.json();

        // Si el registro incluye login automático, guardar token
        if (responseData.token) {
          localStorage.setItem('authToken', responseData.token);
          localStorage.setItem('userType', userData.userType || 'resident');
          localStorage.setItem('userEmail', userData.email);
        }

        return responseData;
      } catch (error) {
        // Limpiar datos de autenticación en caso de error
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
        throw error;
      }
    },

    /**
     * Obtener información del usuario autenticado
     * Usa el endpoint /api/users/me según la documentación de Postman
     */
    getCurrentUser: async () => {
      return fetchWrapper('/users/me', { method: 'GET' });
    },
  },
};
