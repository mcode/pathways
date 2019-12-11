import React, { FC, createContext, useContext, ReactNode } from 'react';
import { Pathway } from 'pathways-model';

interface PathwayProviderProps {
  children: ReactNode;
  pathway: Pathway | null;
}

export const PathwayContext = createContext<Pathway | null>(null);

export const PathwayProvider: FC<PathwayProviderProps> = ({ children, pathway }) => {
  return <PathwayContext.Provider value={pathway}>{children}</PathwayContext.Provider>;
};

export const usePathwayContext = (): any => useContext(PathwayContext);
