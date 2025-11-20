import { useState, useCallback } from 'react';
import { resolveIssue } from '../services/api';
import { ResolveRequest, ResolveResponse } from '../types/api';
import { handleApiError, logError } from '../utils/errorHandler';

interface UseResolveReturn {
  resolve: (data: ResolveRequest) => Promise<ResolveResponse>;
  loading: boolean;
  error: string | null;
  result: ResolveResponse | null;
  reset: () => void;
}

/**
 * Hook for resolving issues via the API
 */
export const useResolve = (): UseResolveReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResolveResponse | null>(null);

  const resolve = useCallback(async (data: ResolveRequest): Promise<ResolveResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await resolveIssue(data);
      setResult(response);
      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      const errorMessage = apiError.message || 'Failed to resolve issue';
      setError(errorMessage);
      logError(err, 'useResolve');
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return { resolve, loading, error, result, reset };
};
