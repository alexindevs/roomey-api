export interface SuccessResponse {
  message: string;
  code: number;
  data: any;
}

export interface ErrorResponse {
  error: string;
  code: number;
}
