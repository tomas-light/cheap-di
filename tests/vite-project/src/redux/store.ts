import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { container } from 'cheap-di';
import { controllerMiddleware, getReducersFromStoreSlices, storeSlice } from 'redux-controller-middleware';

// just to turn off redux warning about empty reducers list
@storeSlice
class EmptySlice {}

export const store = configureStore({
  reducer: combineReducers(getReducersFromStoreSlices({ empty: EmptySlice })),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      controllerMiddleware({
        container,
      })
    ),
});
