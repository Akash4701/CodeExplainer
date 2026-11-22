export interface ApiErrorInfo {
  code: string;
  title: string;
  message: string;
  retryable: boolean;
  retryAfter?: number;
  status: number;
}

export async function readApiError(
  response: Response,
  fallback: string,
  payload?: Record<string, unknown>,
): Promise<ApiErrorInfo> {
  let data: Record<string, unknown> = payload ?? {};
  if (!payload) {
    try {
      data = await response.json() as Record<string, unknown>;
    } catch {
      // The response is not JSON, so use the HTTP status below.
    }
  }

  const status = response.status;
  if (typeof data.title === 'string' && typeof data.message === 'string') {
    return {
      code: typeof data.code === 'string' ? data.code : 'REQUEST_FAILED',
      title: data.title,
      message: data.message,
      retryable: data.retryable !== false,
      retryAfter: typeof data.retryAfter === 'number' ? data.retryAfter : undefined,
      status,
    };
  }

  if (status === 429) {
    return {
      code: 'MODEL_BUSY',
      title: 'The AI is receiving too many requests',
      message: 'The model is temporarily busy or has reached a usage limit. Wait a moment, then try again.',
      retryable: true,
      retryAfter: 30,
      status,
    };
  }
  if (status === 503) {
    return {
      code: 'MODEL_UNAVAILABLE',
      title: 'The AI is temporarily unavailable',
      message: 'The model service is temporarily unavailable. Please try again shortly.',
      retryable: true,
      retryAfter: 15,
      status,
    };
  }

  return {
    code: typeof data.error === 'string' ? 'REQUEST_FAILED' : 'NETWORK_ERROR',
    title: 'Unable to complete this request',
    message: typeof data.error === 'string' ? data.error : fallback,
    retryable: status >= 500 || status === 429,
    status,
  };
}

export function formatRetryTime(seconds?: number): string {
  if (!seconds) return 'a moment';
  return seconds < 60 ? `${seconds} seconds` : `${Math.ceil(seconds / 60)} minute${seconds >= 120 ? 's' : ''}`;
}
