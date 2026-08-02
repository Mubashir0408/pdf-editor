export interface ApiSuccessBody<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
  status: number;
  timestamp: string;
  requestId: string;
}
