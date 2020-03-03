import React, { FC, createContext, useContext, ReactNode } from 'react';
import { usePathwayContext } from './PathwayProvider';
import { usePatient } from './PatientProvider';
import { getHumanName } from 'utils/fhirUtils';
export interface Note {
  patient: string;
  date: string;
  physician: string;
  birthdate?: string;
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
  date: Date;
  physician: string;
}

export const NoteContext = createContext<Note | null>(null);

export const NoteProvider: FC<NoteProviderProps> = ({ children, date, physician }) => {
  const patient = usePatient();
  const name = patient.name ? getHumanName(patient.name) : '';
  const note: Note = {
    patient: name,
    date: date.toDateString(),
    physician: physician,
    birthdate: patient.birthDate || '',
    mcodeElements: {},
    pathway: usePathwayContext().evaluatedPathway?.pathway.name,
    status: 'Pending'
  };

  return <NoteContext.Provider value={note}>{children}</NoteContext.Provider>;
};

export const useNote = (): Note | null => useContext(NoteContext);

export const toString = (note: Note): string => {
  let mcodeElements = '';
  Object.keys(note.mcodeElements).forEach(element => {
    mcodeElements += `${element}: ${note.mcodeElements[element]}\n`;
  });
  const noteString = `Date: ${note.date}\n
Patient: ${note.patient}\n
Birthdate: ${note.birthdate}\n
Physician: ${note.physician}\n
${mcodeElements}
Pathway: ${note.pathway}\n
Node: ${note.node}\n
Status: ${note.status}\n
Treatment: ${note.treatment}\n
Notes: ${note.notes}
  `;
  return noteString;
};
