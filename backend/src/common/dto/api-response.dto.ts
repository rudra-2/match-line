/**
 * Common DTO for API responses
 */
export class ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  timestamp: string;

  constructor(status: 'success' | 'error', data?: T, message?: string) {
    this.status = status;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}
