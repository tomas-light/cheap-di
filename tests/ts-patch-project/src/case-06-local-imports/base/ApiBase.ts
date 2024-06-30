import { ApiInterceptor } from '../ApiInterceptor';

export abstract class ApiBase {
  constructor(private interceptor: ApiInterceptor) {
    if (!interceptor) {
      throw new Error("Can't instantiate Api. Have not enough arguments.");
    }
  }
}
