import { ApiError, NetworkError, ParseError } from '@/lib/errors'

// Global configuration
interface FetchConfig {
  baseURL?: string
  defaultHeaders?: Record<string, string>
  timeout?: number
  retries?: number
  retryDelay?: number
}

let globalConfig: FetchConfig = {
  timeout: 30000,
  retries: 0,
  retryDelay: 1000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
}

export function configureFetch(config: Partial<FetchConfig>) {
  globalConfig = { ...globalConfig, ...config }
}

export function getFetchConfig(): FetchConfig {
  return { ...globalConfig }
}

interface FetchApiOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  logRequest?: boolean
  logResponse?: boolean
}

export async function fetchApi<T>(url: string, options?: FetchApiOptions): Promise<T> {
  const config = { ...globalConfig }
  const {
    timeout = config.timeout,
    retries = config.retries ?? 0,
    retryDelay = config.retryDelay,
    logRequest = false,
    logResponse = false,
    ...fetchOptions
  } = options || {}

  // Apply base URL if provided
  const fullUrl = config.baseURL ? `${config.baseURL}${url}` : url

  // Merge default headers with provided headers
  const headers = {
    ...config.defaultHeaders,
    ...fetchOptions.headers,
  }

  const attemptRequest = async (attempt: number = 1): Promise<T> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      if (logRequest) {
        console.log(`[fetchApi] Request (attempt ${attempt}):`, {
          url: fullUrl,
          method: fetchOptions.method || 'GET',
          headers,
          body: fetchOptions.body ? '***' : undefined,
        })
      }

      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (logResponse) {
        console.log(`[fetchApi] Response (attempt ${attempt}):`, {
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new ApiError(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
          response.status,
          fullUrl,
          errorText
        )
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        if (text === '') {
          return {} as T
        }
        throw new ParseError(`Expected JSON response but got ${contentType}`, fullUrl)
      }

      const data = await response.json()

      if (data === null || data === undefined) {
        throw new ParseError(`API returned null/undefined for ${fullUrl}`, fullUrl)
      }

      return data
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(`Request timeout for ${fullUrl}`, fullUrl, error)
      }

      if (
        attempt <= retries &&
        retryDelay &&
        (error instanceof NetworkError || error instanceof ApiError)
      ) {
        console.warn(`[fetchApi] Retrying request (${attempt}/${retries}):`, fullUrl)
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        return attemptRequest(attempt + 1)
      }

      if (
        error instanceof ApiError ||
        error instanceof NetworkError ||
        error instanceof ParseError
      ) {
        throw error
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(`Network error for ${fullUrl}: ${error.message}`, fullUrl, error)
      }

      if (error instanceof SyntaxError) {
        throw new ParseError(`JSON parsing error for ${fullUrl}: ${error.message}`, fullUrl, error)
      }

      if (error instanceof Error) {
        throw new Error(`fetchApi error for ${fullUrl}: ${error.message}`)
      }

      throw new Error(`fetchApi error for ${fullUrl}: ${String(error)}`)
    }
  }

  return attemptRequest()
}

// Convenience methods
export const api = {
  get: <T>(url: string, options?: FetchApiOptions) =>
    fetchApi<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, data?: unknown, options?: FetchApiOptions) =>
    fetchApi<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(url: string, data?: unknown, options?: FetchApiOptions) =>
    fetchApi<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(url: string, data?: unknown, options?: FetchApiOptions) =>
    fetchApi<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(url: string, options?: FetchApiOptions) =>
    fetchApi<T>(url, { ...options, method: 'DELETE' }),
}
