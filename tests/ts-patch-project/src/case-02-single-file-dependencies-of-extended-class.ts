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
  getData() {
    return this.get('-456');
  }
}

import cheapDi from 'cheap-di';

const metadata = cheapDi.findMetadata(ApiBase as any);
if (!metadata) {
  console.log('no ApiBase metadata');
} else {
  console.log('ApiBase metadata:');
  console.log(metadata.dependencies);
}

const metadata2 = cheapDi.findMetadata(MyApi as any);
if (!metadata2) {
  console.log('no MyApi metadata');
} else {
  console.log('MyApi metadata:');
  console.log(metadata2.dependencies);
}

cheapDi.container
  .registerInstance(
    new ApiInterceptor(() => {
      console.log('dispatched...');
    })
  )
  .as(ApiInterceptor);
const myApi = cheapDi.container.resolve(MyApi);
if (!myApi) {
  console.log('no my api');
} else {
  console.log(myApi.getData());
}
