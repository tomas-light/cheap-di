import { container } from 'cheap-di';
import { ApiInterceptor, MyApi } from './file1.js';

beforeEach(() => {
  container.clear();
});

describe('resolving several dependencies', () => {
  const dispatch = jest.fn();
  container.registerImplementation(ApiInterceptor).inject(dispatch);
  container.registerImplementation(MyApi);

  const myApi = container.resolve(MyApi);
  test('api resolved', () => {
    expect(myApi).not.toBe(null);
  });
  test('api has passed parameter', () => {
    expect(myApi!.interceptor).not.toBe(null);
    expect(myApi!.interceptor!.dispatch).not.toBe(null);
  });
  test('api method works', () => {
    expect(myApi!.getData()).toBe('123-456');
    expect(dispatch).toBeCalledTimes(1);
  });
});
