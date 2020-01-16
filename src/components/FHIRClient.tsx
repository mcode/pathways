import React, { FC, createContext, useContext, ReactNode } from 'react';
import { PathwaysClient } from 'pathways-client';

interface FHIRClientProviderProps {
  client: PathwaysClient; // TODO: fhirclient.Client
  children: ReactNode;
}

export const FHIRClientContext = createContext({});

export const FHIRClientProvider: FC<FHIRClientProviderProps> = ({ client, children }) => (
  <FHIRClientContext.Provider value={client}>{children}</FHIRClientContext.Provider>
);

export const useFHIRClient = (): PathwaysClient => useContext(FHIRClientContext);
