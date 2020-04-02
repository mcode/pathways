import React, { FC, createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { useFHIRClient } from './FHIRClient';
import { Patient } from 'fhir-objects';
interface PatientProviderProps {
  children: ReactNode;
  value: PatientContextInterface;
}

interface PatientContextInterface {
  patient: Patient | null;
  setPatient: Function;
}

export const PatientContext = createContext<PatientContextInterface>({
  patient: null,
  setPatient: (): void => {
    return;
  }
});

export const PatientProvider: FC<PatientProviderProps> = ({ children, value }) => {
  // const client = useFHIRClient();
  // const [currentPatient, setCurrentPatient] = useState<Patient | null>(patient || null);

  // useEffect(() => {
  //   client?.patient?.read?.().then((patient: Patient) => setCurrentPatient(patient));
  // }, [client]);

  return value.patient == null ? (
    <div>Loading...</div>
  ) : (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const usePatient = (): PatientContextInterface => useContext(PatientContext)!;
