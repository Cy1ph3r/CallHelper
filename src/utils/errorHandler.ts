import { ApiError } from '../types/api';

/**
 * Parse error from various sources and return a standardized ApiError
 */
export const handleApiError = (error: any): ApiError => {
  // Axios error
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    return {
      status,
      message: data?.error || data?.message || 'An error occurred',
      data,
    };
  }

  // Network error
  if (error.request && !error.response) {
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
      data: error,
    };
  }

  // Other errors
  return {
    status: 500,
    message: error.message || 'An unexpected error occurred',
    data: error,
  };
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  const apiError = handleApiError(error);
  
  // Status-specific messages
  switch (apiError.status) {
    case 400:
      return 'البيانات المرسلة غير صحيحة. الرجاء التحقق والمحاولة مجددا.';
    case 401:
      return 'الرجاء تسجيل الدخول أولا.';
    case 403:
      return 'ليس لديك صلاحيات لإجراء هذا الفعل.';
    case 404:
      return 'المورد المطلوب غير متوفر.';
    case 500:
      return 'خطأ في الخادم. الرجاء المحاولة لاحقا.';
    case 0:
      return apiError.message; // Network error
    default:
      return apiError.message || 'حدث خطأ. الرجاء المحاولة مجددا.';
  }
};

/**
 * Log error for debugging
 */
export const logError = (error: any, context: string = ''): void => {
  const apiError = handleApiError(error);
  console.error(`[Error${context ? ` - ${context}` : ''}]`, {
    status: apiError.status,
    message: apiError.message,
    data: apiError.data,
  });
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  const apiError = handleApiError(error);
  
  // Don't retry client errors (4xx)
  if (apiError.status >= 400 && apiError.status < 500) {
    return false;
  }
  
  // Retry server errors (5xx) and network errors
  return true;
};
