import React, { FC, createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useFHIRClient } from './FHIRClient';
import { getPatientRecord } from 'utils/fhirExtract';

interface PatientRecordsProviderProps {
  children: ReactNode;
  patientRecords?: fhir.DomainResource[];
}

interface PatientRecordsContextInterface {
  patientRecords: fhir.DomainResource[];
  setPatientRecords: Function;
}

export const PatientRecordsContext = createContext<PatientRecordsContextInterface>({
  patientRecords: [],
  setPatientRecords: (): void => {
    return;
  }
});

export const PatientRecordsProvider: FC<PatientRecordsProviderProps> = ({
  children,
  patientRecords
}) => {
  const client = useFHIRClient();
  const [currentPatientRecords, setPatientRecords] = useState<fhir.DomainResource[]>(
    patientRecords || []
  );
  const value = { patientRecords: currentPatientRecords, setPatientRecords };

  useEffect(() => {
    // TODO: MockedFHIRClient has not mocked out requests for resources yet
    if (client?.patient?.read) {
      getPatientRecord(client).then((records: fhir.DomainResource[]) => {
        // filters out values that are empty
        // the server might return deleted
        // resources that only include an
        // id, meta, and resourceType
        const values = ['id', 'meta', 'resourceType'];
        records = records.filter(resource => {
          return !Object.keys(resource).every(value => values.includes(value));
        });

        setPatientRecords(records);
      });
    }
  }, [client]);

  return <PatientRecordsContext.Provider value={value}>{children}</PatientRecordsContext.Provider>;
};

export const usePatientRecords = (): PatientRecordsContextInterface =>
  useContext(PatientRecordsContext);
