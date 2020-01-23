import React, { FC, createContext, useContext, ReactNode } from 'react';
import { PathwayContextInterface } from 'pathways-model';

interface PathwayProviderProps {
  children: ReactNode;
  pathwayCtx: PathwayContextInterface;
}

export const PathwayContext = createContext<PathwayContextInterface>({
  patientPathway: null,
  setPatientPathway: () => {
    //do nothing
  }
});

export const PathwayProvider: FC<PathwayProviderProps> = ({ children, pathwayCtx }) => {
  return <PathwayContext.Provider value={pathwayCtx}>{children}</PathwayContext.Provider>;
};

export const usePathwayContext = (): PathwayContextInterface => useContext(PathwayContext);
