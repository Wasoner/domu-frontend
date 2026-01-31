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

/**
 * Get selected building ID from localStorage
 */
const getSelectedBuildingId = () => {
  return localStorage.getItem('selectedBuildingId');
};

const roleIdToUserType = (roleId) => {
  if (roleId === 1) return 'admin';
  if (roleId === 3) return 'concierge';
  if (roleId === 4) return 'staff';
  return 'resident';
};

const userTypeToRoleId = (userType) => {
  if (userType === 'admin') return 1;
  if (userType === 'concierge') return 3;
  if (userType === 'staff') return 4;
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
    const isFormData = options.body instanceof FormData;

    // Agregar headers del options primero
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    // Si hay body y no hay Content-Type definido, agregarlo (solo para JSON)
    if (options.body && !headers.has('Content-Type') && !headers.has('content-type') && !isFormData) {
      headers.set('Content-Type', 'application/json');
    }

    // Agregar token de autenticación si existe
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Agregar Building ID seleccionado para filtrar datos por comunidad
    const selectedBuildingId = getSelectedBuildingId();
    if (selectedBuildingId) {
      headers.set('X-Building-Id', selectedBuildingId);
      if (import.meta.env.DEV) {
        console.log('[API] Agregando header X-Building-Id:', selectedBuildingId, 'para endpoint:', url);
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn('[API] No hay selectedBuildingId en localStorage para endpoint:', url);
      }
    }

    // Log para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      let bodyForLog = undefined;
      if (options.body) {
        if (isFormData) {
          bodyForLog = '[FormData]';
        } else if (typeof options.body === 'string') {
          try {
            bodyForLog = JSON.parse(options.body);
          } catch {
            bodyForLog = options.body;
          }
        } else {
          bodyForLog = options.body;
        }
      }
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
 * Fetch helper for binary responses (PDF, boletas).
 */
const fetchBlob = async (url, options = {}) => {
  try {
    const token = getAuthToken();
    const headers = new Headers();
    const isFormData = options.body instanceof FormData;

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    if (options.body && !headers.has('Content-Type') && !headers.has('content-type') && !isFormData) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const selectedBuildingId = getSelectedBuildingId();
    if (selectedBuildingId) {
      headers.set('X-Building-Id', selectedBuildingId);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body,
      ...(options.credentials && { credentials: options.credentials }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="([^"]+)"/);
    const fileName = match?.[1];
    return { blob, fileName };
  } catch (error) {
    console.error('API Error (blob):', error);
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
          } catch {
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
      localStorage.removeItem('selectedBuildingId');
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
          } catch {
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

  finance: {
    getMyCharges: async () => fetchWrapper('/finance/my-charges', { method: 'GET' }),
    listPeriods: async (params = {}) => {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      const suffix = query.toString() ? `?${query.toString()}` : '';
      return fetchWrapper(`/finance/periods${suffix}`, { method: 'GET' });
    },
    createPeriod: async (data) => fetchWrapper('/finance/periods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    addCharges: async (periodId, data) => fetchWrapper(`/finance/periods/${periodId}/charges`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    listMyPeriods: async (params = {}) => {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      const suffix = query.toString() ? `?${query.toString()}` : '';
      return fetchWrapper(`/finance/my-periods${suffix}`, { method: 'GET' });
    },
    getMyPeriodDetail: async (periodId) => fetchWrapper(`/finance/my-periods/${periodId}`, { method: 'GET' }),
    downloadMyPeriodPdf: async (periodId) => fetchBlob(`/finance/my-periods/${periodId}/pdf`, { method: 'GET' }),
    uploadChargeReceipt: async (chargeId, file) => {
      const formData = new FormData();
      formData.append('document', file);
      return fetchWrapper(`/finance/charges/${chargeId}/receipt`, {
        method: 'POST',
        body: formData,
      });
    },
    downloadChargeReceipt: async (chargeId) => fetchBlob(`/finance/charges/${chargeId}/receipt`, { method: 'GET' }),
  },

  buildings: {
    createRequest: async (data) => {
      const formData = new FormData();
      const {
        documentFile,
        proofText,
        floors,
        unitsCount,
        latitude,
        longitude,
        ...rest
      } = data || {};

      const payload = {
        ...rest,
        floors: floors ?? null,
        unitsCount: unitsCount ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        proofText: (proofText && String(proofText).trim()) || 'Documento de acreditación adjunto',
      };

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      if (documentFile) {
        formData.append('document', documentFile);
      }

      return fetchWrapper('/buildings/requests', {
        method: 'POST',
        body: formData,
      });
    },
  },

  visits: {
    create: async (data) => fetchWrapper('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    listMine: async () => fetchWrapper('/visits/my', { method: 'GET' }),
    checkIn: async (authorizationId) => fetchWrapper(`/visits/${authorizationId}/check-in`, {
      method: 'POST',
    }),
    history: async (query = '') => {
      const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
      return fetchWrapper(`/visits/history${suffix}`, { method: 'GET' });
    },
    contacts: {
      create: async (data) => fetchWrapper('/visit-contacts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      list: async (query = '', limit) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (limit) params.set('limit', String(limit));
        const suffix = params.toString() ? `?${params.toString()}` : '';
        return fetchWrapper(`/visit-contacts${suffix}`, { method: 'GET' });
      },
      delete: async (contactId) => fetchWrapper(`/visit-contacts/${contactId}`, {
        method: 'DELETE',
      }),
      register: async (contactId, data = {}) => fetchWrapper(`/visit-contacts/${contactId}/register`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    },
  },

  incidents: {
    listMine: async (params = {}) => {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      const suffix = query.toString() ? `?${query.toString()}` : '';
      return fetchWrapper(`/incidents/my${suffix}`, { method: 'GET' });
    },
    create: async (data) => fetchWrapper('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateStatus: async (incidentId, status) => fetchWrapper(`/incidents/${incidentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  },

  adminInvites: {
    getInfo: async (code) => {
      if (!code) {
        throw new Error('Código de invitación no proporcionado');
      }
      return fetchWrapper(`/admin-invites/${encodeURIComponent(code)}`, { method: 'GET' });
    },
    register: async (code, data) => {
      if (!code) {
        throw new Error('Código de invitación no proporcionado');
      }
      const payload = {
        firstName: data.firstName?.trim() || '',
        lastName: data.lastName?.trim() || '',
        phone: data.phone?.trim() || '',
        documentNumber: data.documentNumber?.trim() || '',
        password: data.password || '',
      };
      return fetchWrapper(`/admin-invites/${encodeURIComponent(code)}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  adminUsers: {
    create: async (data) => {
      const payload = {
        unitId: data.unitId ? Number(data.unitId) : null,
        roleId: Number(data.roleId),
        firstName: String(data.firstName || '').trim(),
        lastName: String(data.lastName || '').trim(),
        birthDate: data.birthDate || null,
        email: String(data.email || '').trim(),
        phone: String(data.phone || '').trim(),
        documentNumber: String(data.documentNumber || '').trim(),
        resident: Boolean(data.resident),
        password: String(data.password || ''),
      };
      if (Number.isNaN(payload.roleId)) {
        throw new Error('roleId inválido');
      }
      return fetchWrapper('/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    getResidents: async () => fetchWrapper('/admin/residents', { method: 'GET' }),
  },

  users: {
    updateProfile: async (data) => {
      const payload = {
        firstName: String(data.firstName || '').trim(),
        lastName: String(data.lastName || '').trim(),
        phone: String(data.phone || '').trim(),
        documentNumber: String(data.documentNumber || '').trim(),
      };
      return fetchWrapper('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    changePassword: async (currentPassword, newPassword) => {
      return fetchWrapper('/users/me/password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
    },
  },

  amenities: {
    list: async () => fetchWrapper('/amenities', { method: 'GET' }),
    listAll: async () => fetchWrapper('/amenities/all', { method: 'GET' }),
    get: async (amenityId) => fetchWrapper(`/amenities/${amenityId}`, { method: 'GET' }),
    create: async (data) => {
      const payload = {
        buildingId: data.buildingId ? Number(data.buildingId) : null,
        name: String(data.name || '').trim(),
        description: data.description?.trim() || null,
        maxCapacity: data.maxCapacity ? Number(data.maxCapacity) : null,
        costPerSlot: data.costPerSlot ? Number(data.costPerSlot) : 0,
        rules: data.rules?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        status: data.status || 'ACTIVE',
      };
      return fetchWrapper('/amenities', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update: async (amenityId, data) => {
      const payload = {
        name: String(data.name || '').trim(),
        description: data.description?.trim() || null,
        maxCapacity: data.maxCapacity ? Number(data.maxCapacity) : null,
        costPerSlot: data.costPerSlot ? Number(data.costPerSlot) : 0,
        rules: data.rules?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        status: data.status || 'ACTIVE',
      };
      return fetchWrapper(`/amenities/${amenityId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    delete: async (amenityId) => fetchWrapper(`/amenities/${amenityId}`, { method: 'DELETE' }),
    getAvailability: async (amenityId, date) => {
      const dateParam = date ? `?date=${date}` : '';
      return fetchWrapper(`/amenities/${amenityId}/availability${dateParam}`, { method: 'GET' });
    },
    reserve: async (amenityId, data) => {
      const payload = {
        timeSlotId: Number(data.timeSlotId),
        reservationDate: data.reservationDate,
        notes: data.notes?.trim() || null,
      };
      return fetchWrapper(`/amenities/${amenityId}/reserve`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    getReservations: async (amenityId) => fetchWrapper(`/amenities/${amenityId}/reservations`, { method: 'GET' }),
    configureTimeSlots: async (amenityId, slots) => {
      const payload = {
        slots: slots.map((slot) => ({
          dayOfWeek: Number(slot.dayOfWeek),
          startTime: slot.startTime,
          endTime: slot.endTime,
          active: slot.active !== false,
        })),
      };
      return fetchWrapper(`/amenities/${amenityId}/time-slots`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  reservations: {
    listMine: async () => fetchWrapper('/reservations/my', { method: 'GET' }),
    cancel: async (reservationId) => fetchWrapper(`/reservations/${reservationId}`, { method: 'DELETE' }),
  },

  housingUnits: {
    list: async () => fetchWrapper('/admin/housing-units', { method: 'GET' }),
    getById: async (id) => fetchWrapper(`/admin/housing-units/${id}`, { method: 'GET' }),
    create: async (data) => {
      const payload = {
        number: String(data.number || '').trim(),
        tower: String(data.tower || '').trim(),
        floor: String(data.floor || '').trim(),
        aliquotPercentage: data.aliquotPercentage ? Number(data.aliquotPercentage) : null,
        squareMeters: data.squareMeters ? Number(data.squareMeters) : null,
      };
      return fetchWrapper('/admin/housing-units', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update: async (id, data) => {
      const payload = {
        number: String(data.number || '').trim(),
        tower: String(data.tower || '').trim(),
        floor: String(data.floor || '').trim(),
        aliquotPercentage: data.aliquotPercentage ? Number(data.aliquotPercentage) : null,
        squareMeters: data.squareMeters ? Number(data.squareMeters) : null,
      };
      return fetchWrapper(`/admin/housing-units/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    delete: async (id) => fetchWrapper(`/admin/housing-units/${id}`, { method: 'DELETE' }),
    linkResident: async (unitId, userId) => {
      try {
        const response = await fetchWrapper(`/admin/housing-units/${unitId}/residents`, {
          method: 'POST',
          body: JSON.stringify({ userId: Number(userId) }),
        });
        // 204 No Content es una respuesta exitosa
        return response;
      } catch (error) {
        // Re-lanzar el error para que el componente pueda manejarlo
        throw error;
      }
    },
    unlinkResident: async (unitId, userId) => {
      return fetchWrapper(`/admin/housing-units/${unitId}/residents/${userId}`, {
        method: 'DELETE',
      });
    },
  },
};
