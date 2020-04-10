import React, {
  FC,
  createContext,
  useContext,
  ReactNode,
  useState,
  SetStateAction,
  Dispatch
} from 'react';
import { usePathwayContext } from './PathwayProvider';
import { usePatient } from './PatientProvider';
import { getHumanName } from 'utils/fhirUtils';
import { useUser } from './UserProvider';
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

interface NoteDataProviderProps {
  children: ReactNode;
  date: Date;
  physician: string;
}

interface NoteContextProps {
  note: Note | null;
  setNote: Dispatch<SetStateAction<Note>> | (() => void);
}

export const NoteContext = createContext<NoteContextProps>({
  note: null,
  setNote: () => {
    // do nothing.
  }
});

export const NoteDataProvider: FC<NoteDataProviderProps> = ({ children, date, physician }) => {
  const patient = usePatient().patient as fhir.Patient;
  const { user } = useUser();
  const name = patient?.name ? getHumanName(patient.name) : '';
  const [note, setNote] = useState<Note>({
    patient: name,
    date: date.toDateString(),
    physician: user,
    birthdate: patient?.birthDate || '',
    mcodeElements: {},
    pathway: usePathwayContext().evaluatedPathway?.pathway.name,
    status: 'Pending'
  });

  return <NoteContext.Provider value={{ note, setNote }}>{children}</NoteContext.Provider>;
};

export const useNote = (): NoteContextProps => useContext(NoteContext);

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
