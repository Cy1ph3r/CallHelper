import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ResolveRequest,
  ResolveResponse,
  ChatRequest,
  ChatResponse,
  SearchRequest,
  SearchResponse,
} from '../types/api';
import { handleApiError, logError } from '../utils/errorHandler';

// Get API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logError(error, 'Request Interceptor');
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    const apiError = handleApiError(error);
    logError(error, `Response ${apiError.status}`);
    return Promise.reject(error);
  }
);

// ============================================
// API Methods
// ============================================

/**
 * Resolve an issue and get a response
 */
export const resolveIssue = async (data: ResolveRequest): Promise<ResolveResponse> => {
  try {
    const response = await apiClient.post<ResolveResponse>('/api/resolve', {
      name: data.name,
      user_type: data.user_type,
      issue: data.issue,
      get_alternatives: data.get_alternatives,  // Include get_alternatives parameter
    });
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

/**
 * Send a chat message and get a response
 */
export const sendChatMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await apiClient.post<ChatResponse>('/api/chat', {
      message: data.message,
      user_type: data.user_type || 'شركة عمرة',
      session_id: data.session_id,
      is_first: data.is_first || false,
    });
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

/**
 * Get welcome message for chat (first message)
 */
export const getChatWelcome = async (userType: string = 'شركة عمرة'): Promise<ChatResponse> => {
  return sendChatMessage({
    message: '',
    user_type: userType,
    is_first: true,
  });
};

/**
 * Search for a solution (HTML form endpoint)
 */
export const searchSolution = async (data: SearchRequest): Promise<SearchResponse> => {
  try {
    const formData = new FormData();
    formData.append('caller_name', data.caller_name);
    formData.append('caller_type', data.caller_type);
    formData.append('issue_description', data.issue_description);
    
    if (data.activation) formData.append('activation', data.activation);
    if (data.registration) formData.append('registration', data.registration);
    if (data.request_status) formData.append('request_status', data.request_status);

    const response = await apiClient.post<SearchResponse>('/search', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};

/**
 * Check API health
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/');
    return response.status === 200;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
};

/**
 * Get the API base URL
 */
export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
};

export default apiClient;
