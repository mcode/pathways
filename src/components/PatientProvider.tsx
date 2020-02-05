import React, { FC, createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useFHIRClient } from './FHIRClient';

interface PatientProviderProps {
  children: ReactNode;
  patient?: fhir.Patient;
}

export const PatientContext = createContext<fhir.Patient | null>(null);

export const PatientProvider: FC<PatientProviderProps> = ({ children, patient }) => {
  const client = useFHIRClient();
  const [currentPatient, setCurrentPatient] = useState<fhir.Patient | null>(patient || null);

  useEffect(() => {
    client?.patient?.read?.().then((patient: fhir.Patient) => setCurrentPatient(patient));
  }, [client]);

  return currentPatient == null ? (
    <div>Loading...</div>
  ) : (
    <PatientContext.Provider value={currentPatient}>{children}</PatientContext.Provider>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const usePatient = (): fhir.Patient => useContext(PatientContext)!;
