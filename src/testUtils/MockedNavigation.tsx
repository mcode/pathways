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

  const [currentPathway, setCurrentPathway] = useState<PatientPathway | null>(null);
  const [patientPathwayList, setPatientPathwayList] = useState<PatientPathway[]>(defaultList);

  function setPatientPathwayCallback(value: PatientPathway | null, selectPathway = false): void {
    if (value !== null) setCurrentPathway(value);
  }

  function updatePatientPathwayList(value: PatientPathway): void {
    const newList = [...patientPathwayList]; // Create a deep copy of list
    for (let i = 0; i < patientPathwayList.length; i++) {
      if (patientPathwayList[i].pathway.name === value.pathway.name) {
        newList[i] = value;
        setPatientPathwayList(newList);
      }
    }
  }

  return (
    <MockedPatientProvider>
      <MockedPathwayProvider
        pathwayCtx={{
          patientPathway: currentPathway,
          setPatientPathway: setPatientPathwayCallback,
          updatePatientPathwayList: updatePatientPathwayList
        }}
      >
        <Navigation
          patientPathwayList={patientPathwayList}
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
