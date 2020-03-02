import React, { FC, createContext, useContext, ReactNode } from 'react';
import { usePathwayContext } from './PathwayProvider';

export interface Note {
  patient: string;
  date: Date;
  physician: string;
  birthdate?: Date;
  mcodeElements: {
    [key: string]: string;
  };
  pathway?: string;
  node?: string;
  status: string;
  treatment?: string;
  notes?: string;
}

interface NoteProviderProps {
  children: ReactNode;
  patient: string;
  date: Date;
  physician: string;
}

export const NoteContext = createContext<Note | null>(null);

export const NoteProvider: FC<NoteProviderProps> = ({ children, patient, date, physician }) => {
  const note: Note = {
    patient: patient,
    date: date,
    physician: physician,
    mcodeElements: {},
    pathway: usePathwayContext().evaluatedPathway?.pathway.name,
    status: 'Pending'
  };

  return <NoteContext.Provider value={note}>{children}</NoteContext.Provider>;
};

export const useNote = (): Note | null => useContext(NoteContext);
