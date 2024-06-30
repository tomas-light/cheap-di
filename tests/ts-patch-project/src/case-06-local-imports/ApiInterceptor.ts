import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export type LoggedApiRequest = AxiosRequestConfig;
export type LoggedApiResponse = AxiosResponse;
export type LoggedApiError =
  | AxiosError
  | {
      message: string;
      statusCode: number;
      error: any;
    };

export class ApiInterceptor {
  static singleton: ApiInterceptor;

  constructor(
    private readonly logApiRequest: (request: LoggedApiRequest) => void,
    private readonly logApiResponse: (response: LoggedApiResponse) => void,
    private readonly logError: (error: LoggedApiError) => void
  ) {
    if (ApiInterceptor.singleton) {
      return ApiInterceptor.singleton;
    }
    ApiInterceptor.singleton = this;
  }
}
