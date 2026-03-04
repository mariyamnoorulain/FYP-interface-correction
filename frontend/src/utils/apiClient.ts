/**
 * Centralized API Client
 * Provides consistent error handling, token management, and request/response interceptors
 */

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  retry?: boolean;
  retryCount?: number;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:5000') {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication token
   */
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any, response?: Response): ApiError {
    if (response) {
      return {
        message: `Request failed with status ${response.status}`,
        status: response.status,
        code: response.statusText,
      };
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection and ensure the server is running.',
        code: 'NETWORK_ERROR',
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }

  /**
   * Refresh token if needed
   */
  private async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token || data.accessToken;
        if (newToken) {
          localStorage.setItem('token', newToken);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Make API request with automatic retry and error handling
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      skipAuth = false,
      retry = true,
      retryCount = 0,
      headers = {},
      ...fetchOptions
    } = options;

    // Build URL
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    // Prepare headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authentication token if not skipped
    if (!skipAuth) {
      const token = this.getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !skipAuth && retry && retryCount === 0) {
        const refreshed = await this.refreshTokenIfNeeded();
        if (refreshed) {
          // Retry request with new token
          return this.request<T>(endpoint, {
            ...options,
            retryCount: 1,
            retry: false, // Don't retry again
          });
        } else {
          // Token refresh failed, clear user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw {
            message: 'Session expired. Please login again.',
            status: 401,
            code: 'SESSION_EXPIRED',
          };
        }
      }

      // Handle non-OK responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        const error: ApiError = {
          message: errorData.message || `Request failed with status ${response.status}`,
          status: response.status,
          code: errorData.code || response.statusText,
          details: errorData,
        };

        throw error;
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text() as any;
    } catch (error: any) {
      // If it's already an ApiError, rethrow it
      if (error.status || error.code) {
        throw error;
      }

      // Otherwise, handle as network/unknown error
      const apiError = this.handleError(error);
      throw apiError;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    
    if (token && !options?.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        throw {
          message: errorData.message || `Upload failed with status ${response.status}`,
          status: response.status,
          code: errorData.code || response.statusText,
          details: errorData,
        };
      }

      return await response.json();
    } catch (error: any) {
      if (error.status || error.code) {
        throw error;
      }

      const apiError = this.handleError(error);
      throw apiError;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiError, RequestOptions };

