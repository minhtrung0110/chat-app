import { ApiResponse } from '../types/apiResponse';

export function apiResponse<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
  return {
    statusCode,
    message,
    data,
  };
}
