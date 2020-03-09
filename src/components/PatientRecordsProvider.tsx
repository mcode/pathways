import React, { FC, createContext, useContext, ReactNode } from 'react';
import { DomainResource } from 'fhir-objects';
interface PatientRecordsProviderProps {
  children: ReactNode;
  value: PatientRecordsContextInterface;
}

interface PatientRecordsContextInterface {
  patientRecords: DomainResource[];
  setPatientRecords: Function;
  evaluatePath: boolean;
  setEvaluatePath: (value: boolean) => void;
}

export const PatientRecordsContext = createContext<PatientRecordsContextInterface>({
  patientRecords: [],
  setPatientRecords: (): void => {
    return;
  },
  evaluatePath: true,
  setEvaluatePath: (): void => {
    return;
  }
});

export const PatientRecordsProvider: FC<PatientRecordsProviderProps> = ({ children, value }) => {
  return <PatientRecordsContext.Provider value={value}>{children}</PatientRecordsContext.Provider>;
};

export const usePatientRecords = (): PatientRecordsContextInterface =>
  useContext(PatientRecordsContext);
