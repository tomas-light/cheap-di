import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { container } from 'cheap-di';
import { controllerMiddleware } from 'redux-controller-middleware';

export const store = configureStore({
  reducer: combineReducers({}),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      controllerMiddleware({
        container,
      })
    ),
});
