import React, { FC, ReactNode } from 'react';
import { PathwayContext } from 'components/PathwayProvider';
import { PathwayContextInterface } from 'pathways-model';

interface PathwayProviderProps {
  children: ReactNode;
  pathwayCtx: PathwayContextInterface;
}

const pathway = {
  name: 'Test Pathway',
  library: 'mCODE.cql',
  criteria: [
    {
      elementName: 'condition',
      expected: 'breast cancer',
      cql: 'some fancy CQL statement'
    }
  ],
  states: [
    {
      Start: {
        label: 'Start',
        transitions: []
      }
    }
  ]
};

export const mockedPathwayCtx = {
  evaluatedPathway: {
    pathway: pathway,
    pathwayResults: null
  },
  setEvaluatedPathway: (): void => {
    //do nothing
  },
  updateEvaluatedPathways: (): void => {
    //do nothing
  }
};

const MockedPathwayProvider: FC<PathwayProviderProps> = ({ pathwayCtx = null, children }) => (
  <PathwayContext.Provider value={pathwayCtx || mockedPathwayCtx}>
    {children}
  </PathwayContext.Provider>
);

export default MockedPathwayProvider;
