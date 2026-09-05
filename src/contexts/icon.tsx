 
import type {ReactNode} from 'react';

import { createContext, useContext} from 'react';

type Icons = 'ex' | 'b';
const IconContext = createContext<Partial<Record<Icons, ReactNode>>>({});

export const IconProvider = IconContext.Provider;

// eslint-disable-next-line react-refresh/only-export-components -- context hook must live beside its provider/Context; splitting a module this small costs more than fast-refresh purity
export function useIconContext() {
  return useContext(IconContext);
}
