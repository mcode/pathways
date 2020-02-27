import React, { FC, createContext, useContext, ReactNode } from 'react';

interface PatientRecordsProviderProps {
  children: ReactNode;
  value: PatientRecordsContextInterface;
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

export const PatientRecordsProvider: FC<PatientRecordsProviderProps> = ({ children, value }) => {
  return <PatientRecordsContext.Provider value={value}>{children}</PatientRecordsContext.Provider>;
};

export const usePatientRecords = (): PatientRecordsContextInterface =>
  useContext(PatientRecordsContext);
