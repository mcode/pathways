import React, { FC, createContext, useContext, ReactNode } from 'react';
import { PathwayContextInterface } from 'pathways-model';

interface PathwayProviderProps {
  children: ReactNode;
  pathwayCtx: PathwayContextInterface;
}

export const PathwayContext = createContext<PathwayContextInterface>({
  evaluatedPathway: null,
  setEvaluatedPathway: () => {
    //do nothing
  },
  updateEvaluatedPathways: () => {
    //do nothing
  },
  assignPathway: () => {
    //do nothing
  },
  unassignPathway: () => {
    //do nothing
  }
});

export const PathwayProvider: FC<PathwayProviderProps> = ({ children, pathwayCtx }) => {
  return <PathwayContext.Provider value={pathwayCtx}>{children}</PathwayContext.Provider>;
};

export const usePathwayContext = (): PathwayContextInterface => useContext(PathwayContext);
