import React, { FC, ReactNode } from 'react';
import { PatientContext } from 'components/PatientProvider';
interface PatientProviderProps {
  children: ReactNode;
}

export const mockedPatient = {
  name: [{ given: ['Jane'], family: 'Doe' }],
  birthDate: '1960-04-01',
  gender: 'female',
  address: [
    {
      state: 'AnyState',
      city: 'AnyCity'
    }
  ]
};

const MockedPatientProvider: FC<PatientProviderProps> = ({ children }) => (
  <PatientContext.Provider
    value={{
      patient: mockedPatient,
      setPatient: (): void => {
        return;
      }
    }}
  >
    {children}
  </PatientContext.Provider>
);

export default MockedPatientProvider;
