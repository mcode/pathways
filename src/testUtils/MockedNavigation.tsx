import React, { FC, useState } from 'react';
import { EvaluatedPathway } from 'pathways-model';
import Navigation from 'components/Navigation';
import MockedPatientProvider from 'testUtils/MockedPatientProvider';
import MockedPathwayProvider from 'testUtils/MockedPathwayProvider';
import { loadedService } from './services';

const MockedNavigation: FC = () => {
  let defaultList: EvaluatedPathway[] = [];
  if (loadedService.status === 'loaded') {
    defaultList = loadedService.payload.map(pathway => ({
      pathway: pathway,
      pathwayResults: null
    }));
  }

  const [currentPathway, setCurrentPathway] = useState<EvaluatedPathway | null>(null);
  const [evaluatedPathways, setEvaluatedPathways] = useState<EvaluatedPathway[]>(defaultList);

  function setEvaluatedPathwayCallback(
    value: EvaluatedPathway | null,
    selectPathway = false
  ): void {
    if (value !== null) setCurrentPathway(value);
  }

  function updateEvaluatedPathways(value: EvaluatedPathway): void {
    const newList = [...evaluatedPathways]; // Create a shallow copy of list
    for (let i = 0; i < evaluatedPathways.length; i++) {
      if (evaluatedPathways[i].pathway.name === value.pathway.name) {
        newList[i] = value;
        setEvaluatedPathways(newList);
      }
    }
  }

  const assignPathway = (pathwayName: string): void => {
    return;
  };

  const unassignPathway = (pathwayName: string): void => {
    return;
  };

  return (
    <MockedPatientProvider>
      <MockedPathwayProvider
        pathwayCtx={{
          evaluatedPathway: currentPathway,
          setEvaluatedPathway: setEvaluatedPathwayCallback,
          updateEvaluatedPathways: updateEvaluatedPathways,
          assignPathway: assignPathway,
          unassignPathway: unassignPathway
        }}
      >
        <Navigation
          evaluatedPathways={evaluatedPathways}
          selectPathway={false}
          setSelectPathway={(): void => {
            //do nothing
          }}
        />
      </MockedPathwayProvider>
    </MockedPatientProvider>
  );
};

export default MockedNavigation;
