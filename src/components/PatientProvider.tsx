import React, { FC, createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useFHIRClient } from './FHIRClient';
import { Patient } from 'fhir-objects';
interface PatientProviderProps {
  children: ReactNode;
  patient?: Patient | null;
}

export const PatientContext = createContext<Patient | null>(null);

export const PatientProvider: FC<PatientProviderProps> = ({ children, patient }) => {
  const client = useFHIRClient();
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(patient || null);

  useEffect(() => {
    client?.patient?.read?.().then((patient: Patient) => setCurrentPatient(patient));
  }, [client]);

  return currentPatient == null ? (
    <div>Loading...</div>
  ) : (
    <PatientContext.Provider value={currentPatient}>{children}</PatientContext.Provider>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const usePatient = (): Patient => useContext(PatientContext)!;
