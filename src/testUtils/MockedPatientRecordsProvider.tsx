import React, { FC, ReactNode } from 'react';
import { PatientRecordsContext } from 'components/PatientRecordsProvider';

interface PatientRecordsProviderProps {
  children: ReactNode;
}

export const mockedRecords: fhir.DomainResource[] = [
  {
    resourceType: 'Patient',
    id: '126040',
    meta: {
      versionId: '1',
      lastUpdated: '2019-08-22T17:03:11.110+00:00',
      profile: ['http://hl7.org/fhir/us/shr/DSTU2/StructureDefinition/shr-core-Patient']
    }
  }
];

const MockedPatientRecordsProvider: FC<PatientRecordsProviderProps> = ({ children }) => (
  <PatientRecordsContext.Provider
    value={{
      patientRecords: mockedRecords,
      setPatientRecords: (): void => {
        return;
      },
      evaluatePath: true,
      setEvaluatePath: (): void => {
        return;
      }
    }}
  >
    {children}
  </PatientRecordsContext.Provider>
);

export default MockedPatientRecordsProvider;
