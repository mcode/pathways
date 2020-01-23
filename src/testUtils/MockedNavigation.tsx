import React, { FC, useState } from 'react';
import { PatientPathway } from 'pathways-model';
import Navigation from 'components/Navigation';
import MockedPatientProvider from 'testUtils/MockedPatientProvider';
import MockedPathwayProvider from 'testUtils/MockedPathwayProvider';

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
          list={[]}
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
