import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface FetchOptions extends RequestInit {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseFetchReturn<T> extends FetchState<T> {
  execute: (url?: string, options?: FetchOptions) => Promise<T | null>;
  reset: () => void;
}

export const useFetch = <T>(
  initialUrl?: string,
  initialOptions?: FetchOptions
): UseFetchReturn<T> => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (url?: string, options?: FetchOptions): Promise<T | null> => {
      const targetUrl = url || initialUrl;
      if (!targetUrl) {
        throw new Error('URL is required for fetch operation');
      }

      const fetchOptions: FetchOptions = {
        ...initialOptions,
        ...options,
      };

      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json()

        setState({
          data,
          isLoading: false,
          error: null,
        });

        if (fetchOptions.showSuccessToast && fetchOptions.successMessage) {
          toast({
            title: "Success",
            description: fetchOptions.successMessage,
          });
        }

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });

        if (fetchOptions.showErrorToast !== false) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }

        return null;
      }
    },
    [initialUrl, initialOptions]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

// Hook for handling form submissions
export const useSubmit = <T>(url?: string, options?: FetchOptions) => {
  const { execute, ...state } = useFetch<T>(url, { ...options, method: 'POST' });

  const submit = useCallback(
    async (body: any, submitUrl?: string, submitOptions?: FetchOptions) => {
      return execute(submitUrl, {
        ...submitOptions,
        headers: {
          'Content-Type': 'application/json',
          ...submitOptions?.headers,
        },
        body: JSON.stringify(body),
      });
    },
    [execute]
  );

  return {
    ...state,
    submit,
  };
};
