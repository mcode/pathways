import React, { FC, createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useFHIRClient } from './FHIRClient';

interface PatientProviderProps {
  children: ReactNode;
  demoPatient?: fhir.Patient;
}

export const PatientContext = createContext<fhir.Patient | null>(null);

export const PatientProvider: FC<PatientProviderProps> = ({ children, demoPatient }) => {
  const client = useFHIRClient();
  const [patient, setPatient] = useState<fhir.Patient | null>(demoPatient || null);

  useEffect(() => {
    if (client && client.patient.read) {
      client.patient.read().then((patient: fhir.Patient) => setPatient(patient));
    }
  }, [client]);

  return patient == null ? (
    <div>Loading...</div>
  ) : (
    <PatientContext.Provider value={patient}>{children}</PatientContext.Provider>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const usePatient = (): fhir.Patient => useContext(PatientContext)!;
