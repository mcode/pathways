import React, { FC, ReactNode } from 'react';
import { PathwayContext } from 'components/PathwayProvider';
import { PathwayContextInterface } from 'pathways-model';

interface PathwayProviderProps {
  children: ReactNode;
  pathwayCtx: PathwayContextInterface;
}

export const mockedPathwayCtx = {
  pathway: {
    name: 'Test Pathway',
    library: 'mCODE.cql',
    states: [
      {
        Start: {
          label: 'Start',
          transitions: []
        }
      }
    ]
  },
  setPathway: (): void => {}
};

const MockedPathwayProvider: FC<PathwayProviderProps> = ({ pathwayCtx = null, children }) => (
  <PathwayContext.Provider value={pathwayCtx || mockedPathwayCtx}>
    {children}
  </PathwayContext.Provider>
);

export default MockedPathwayProvider;
