export type AppErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: Record<string, string[]>;
  statusCode?: number;
  timestamp: string;
  endpoint?: string;
}

export function classifyError(error: unknown, endpoint?: string): AppError {
  const timestamp = new Date().toISOString();

  if (error instanceof DOMException) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return {
        code: 'TIMEOUT',
        message: 'Request timed out. Please check your connection and try again.',
        statusCode: 408,
        timestamp,
        endpoint,
      };
    }
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      code: 'NETWORK_ERROR',
      message: 'No internet connection. Please check your network.',
      statusCode: 0,
      timestamp,
      endpoint,
    };
  }

  const maybeApi = error as AppError | undefined;
  if (maybeApi && typeof maybeApi.code === 'string' && typeof maybeApi.message === 'string') {
    return maybeApi;
  }

  if (error instanceof Error) {
    const unknownError = error as unknown as Record<string, unknown>;
    const maybeStatus = typeof unknownError.statusCode === 'number' ? (unknownError.statusCode as number) : undefined;
    const maybeCode = typeof unknownError.code === 'string' ? (unknownError.code as AppErrorCode) : undefined;

    const code = typeof maybeStatus === 'number' ? classifyByStatus(maybeStatus) : (maybeCode ?? 'UNKNOWN_ERROR');

    return {
      code,
      message: maybeCode === 'UNAUTHORIZED'
        ? 'Your session has expired. Please log in again.'
        : (error.message || 'An unexpected error occurred.'),
      statusCode: maybeStatus,
      timestamp,
      endpoint,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
    timestamp,
    endpoint,
  };
}

function classifyByStatus(status: number): AppErrorCode {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 422) return 'VALIDATION_ERROR';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN_ERROR';
}

export function formatValidationErrors(details?: Record<string, string[]>): string {
  if (!details) return '';
  return Object.entries(details)
    .filter(([, messages]) => messages.length > 0)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n');
}

export function getRetryAfterSeconds(retryAfterHeader?: string): number {
  if (!retryAfterHeader) return 2;
  const seconds = parseInt(retryAfterHeader, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 2;
}

export function withExponentialBackoff(attempt: number, baseDelay = 1000, maxDelay = 10000): number {
  const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
  const jitter = Math.random() * 500;
  return delay + jitter;
}

export function shouldRetry(error: AppError, attempt: number, maxAttempts: number): boolean {
  if (attempt >= maxAttempts) return false;
  const retryable = ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE'];
  return retryable.includes(error.code);
}

export function getUserFriendlyMessage(error: AppError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'No internet connection. Please check your network settings.';
    case 'TIMEOUT':
      return 'Request timed out. The server is taking too long to respond.';
    case 'UNAUTHORIZED':
      return 'Your session has expired. Please log in again.';
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action.';
    case 'NOT_FOUND':
      return 'The requested resource was not found.';
    case 'VALIDATION_ERROR':
      return 'Please check your input and try again.';
    case 'SERVER_ERROR':
      return 'Server error. Please try again later.';
    case 'SERVICE_UNAVAILABLE':
      return 'Service temporarily unavailable. Please try again in a moment.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryOn: AppErrorCode[];
}