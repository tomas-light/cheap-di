export class ApiInterceptor {
  static singleton: ApiInterceptor;

  api?: {
    fetch: () => string;
  };

  constructor(public readonly dispatch: () => any) {
    if (ApiInterceptor.singleton) {
      return ApiInterceptor.singleton;
    }
    ApiInterceptor.singleton = this;

    this.api = {
      fetch: () => {
        this.dispatch();
        return '123';
      },
    };
  }
}

export class ApiBase {
  constructor(public readonly interceptor: ApiInterceptor) {
    if (!interceptor) {
      throw new Error("Can't instantiate Api. Have not enough arguments.");
    }
  }

  protected get(data: string) {
    return this.interceptor.api!.fetch() + data;
  }
}

export class MyApi extends ApiBase {
  constructor(public readonly interceptor: ApiInterceptor) {
    super(interceptor);
  }

  getData() {
    return this.get('-456');
  }
}
