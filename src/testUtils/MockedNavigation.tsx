import React, { FC, useState } from 'react';
import { Pathway, PatientPathway } from 'pathways-model';
import Navigation from 'components/Navigation';
import MockedPatientProvider from 'testUtils/MockedPatientProvider';
import MockedPathwayProvider from 'testUtils/MockedPathwayProvider';
import { loadedService } from './services';

const MockedNavigation: FC = () => {
  const [patientPathway, setPatientPathway] = useState<PatientPathway | null>(null);

  function setPatientPathwayCallback(value: PatientPathway | null, selectPathway = false): void {
    if (value !== null) setPatientPathway(value);
  }

  return (
    <MockedPatientProvider>
      <MockedPathwayProvider
        pathwayCtx={{
          patientPathway: patientPathway,
          setPatientPathway: setPatientPathwayCallback
        }}
      >
        <Navigation
          selectPathway={false}
          service={loadedService}
          setSelectPathway={(): void => {
            //do nothing
          }}
        />
      </MockedPathwayProvider>
    </MockedPatientProvider>
  );
};

export default MockedNavigation;
