import { createReducer } from 'redux-controller-middleware';
import { SingletonService } from './SingletonService.ts';

export const updateToken = createReducer('update token', ({ container }) => {
  const singletonService = container?.resolve(SingletonService);
  if (singletonService) {
    singletonService.token = 'modified token';
    console.log(singletonService.token);
  }
});
