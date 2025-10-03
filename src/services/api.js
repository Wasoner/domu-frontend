/**
 * API Service
 * Centralized API communication layer
 * Example of service structure for handling HTTP requests
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
const fetchWrapper = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Example API methods
 */
export const api = {
  // GET request example
  get: (endpoint) => fetchWrapper(endpoint, { method: 'GET' }),
  
  // POST request example
  post: (endpoint, data) => fetchWrapper(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // PUT request example
  put: (endpoint, data) => fetchWrapper(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // DELETE request example
  delete: (endpoint) => fetchWrapper(endpoint, { method: 'DELETE' }),
};
