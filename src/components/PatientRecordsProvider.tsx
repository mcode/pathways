import React, { FC, createContext, useContext, ReactNode } from 'react';
import { DomainResource } from 'fhir-objects';
import { McodeElements } from 'mcode';
interface PatientRecordsProviderProps {
  children: ReactNode;
  value: PatientRecordsContextInterface;
}

interface PatientRecordsContextInterface {
  patientRecords: DomainResource[];
  setPatientRecords: Function;
  evaluatePath: boolean;
  setEvaluatePath: (value: boolean) => void;
  mcodeRecords: McodeElements;
  setMcodeRecords: (value: DomainResource[]) => void;
}

export const PatientRecordsContext = createContext<PatientRecordsContextInterface>({
  patientRecords: [],
  setPatientRecords: (): void => {
    return;
  },
  evaluatePath: true,
  setEvaluatePath: (): void => {
    return;
  },
  mcodeRecords: {},
  setMcodeRecords: (): void => {
    return;
  }
});

export const PatientRecordsProvider: FC<PatientRecordsProviderProps> = ({ children, value }) => {
  return <PatientRecordsContext.Provider value={value}>{children}</PatientRecordsContext.Provider>;
};

export const usePatientRecords = (): PatientRecordsContextInterface =>
  useContext(PatientRecordsContext);
