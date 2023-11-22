import { createContext } from 'react';
import { ReactContainer } from './ReactContainer.js';

export type DiContextType = {
  container: ReactContainer | undefined;
};

export const DiContext = createContext<DiContextType>({ container: undefined });
