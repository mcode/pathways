import React, { FC, useState } from 'react';
import { PatientPathway } from 'pathways-model';
import Navigation from 'components/Navigation';
import MockedPatientProvider from 'testUtils/MockedPatientProvider';
import MockedPathwayProvider from 'testUtils/MockedPathwayProvider';
import { loadedService } from './services';

const MockedNavigation: FC = () => {
  let defaultList: PatientPathway[] = [];
  if (loadedService.status === 'loaded') {
    defaultList = loadedService.payload.map(pathway => ({
      pathway: pathway,
      pathwayResults: null
    }));
  }

  const [patientPathway, setPatientPathway] = useState<PatientPathway | null>(null);
  const [list, setList] = useState<PatientPathway[]>(defaultList);

  function setPatientPathwayCallback(value: PatientPathway | null, selectPathway = false): void {
    if (value !== null) setPatientPathway(value);
  }

  function updatePatientPathwayList(value: PatientPathway) {
    let newList = [...list]; // Create a deep copy of list
    for (let i in list) {
      if (list[i].pathway.name === value.pathway.name) {
        newList[i] = value;
        setList(newList);
      }
    }
  }

  return (
    <MockedPatientProvider>
      <MockedPathwayProvider
        pathwayCtx={{
          patientPathway: patientPathway,
          setPatientPathway: setPatientPathwayCallback,
          updatePatientPathwayList: updatePatientPathwayList
        }}
      >
        <Navigation
          list={list}
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
