// Error handling utilities for API responses
export interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export class ApiError extends Error {
  code?: string;
  details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export const createErrorResponse = (message: string, statusCode: number = 500, code?: string, details?: any): {
  statusCode: number;
  body: ApiResponse;
} => {
  return {
    statusCode,
    body: {
      success: false,
      error: {
        error: message,
        code,
        details
      }
    }
  };
};

export const createSuccessResponse = <T>(data: T, message?: string): {
  statusCode: number;
  body: ApiResponse<T>;
} => {
  return {
    statusCode: 200,
    body: {
      success: true,
      data,
      error: message ? { error: message } : undefined
    }
  };
};

export const handleApiError = (error: any): {
  statusCode: number;
  body: ApiResponse;
} => {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return createErrorResponse(error.message, 500, error.code, error.details);
  }
  
  if (error?.message) {
    return createErrorResponse(error.message);
  }
  
  return createErrorResponse('Internal server error');
};