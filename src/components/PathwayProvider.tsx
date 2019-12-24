import React, { FC, createContext, useContext, ReactNode } from 'react';
import { PathwayContextInterface } from 'pathways-model';

interface PathwayProviderProps {
  children: ReactNode;
  pathway: PathwayContextInterface;
}

export const PathwayContext = createContext<PathwayContextInterface>({
  pathway: null,
  setPathway: () => {}
});

export const PathwayProvider: FC<PathwayProviderProps> = ({ children, pathway }) => {
  return <PathwayContext.Provider value={pathway}>{children}</PathwayContext.Provider>;
};

export const usePathwayContext = (): PathwayContextInterface => useContext(PathwayContext);
