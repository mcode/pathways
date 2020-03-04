import React, { FC, ReactElement, useState } from 'react';
import { Note } from 'components/NoteProvider';
import styles from './NotePreview.module.scss';
import PathwayPopup from '../PathwayPopup';
import ActionButton from '../ActionButton';

interface NoteConfirmationPopupProps {
  note: Note;
  trigger: ReactElement;
  onConfirm?: () => void;
}

const NoteConfirmationPopup: FC<NoteConfirmationPopupProps> = ({ trigger, onConfirm, note }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <PathwayPopup
      open={open}
      setOpen={setOpen}
      Content={
        <div>
          <NotePreview {...note} />
          <div>
            The above note will be written into the EHR and any procedure requests will be
            submitted. Proceed?
          </div>{' '}
          <div>
            <ActionButton
              size="small"
              type="accept"
              onClick={(): void => {
                onConfirm?.();
                setOpen(false);
              }}
            />
            <ActionButton size="small" type="decline" onClick={(): void => setOpen(false)} />
          </div>
        </div>
      }
      Trigger={trigger}
    />
  );
};

const NotePreview: FC<Note> = ({
  patient,
  date,
  physician,
  birthdate,
  mcodeElements,
  pathway,
  node,
  status,
  treatment,
  notes
}: Note) => {
  return (
    <div className={styles.notePreview}>
      <NoteSection sectionTitle="Date" value={date} />
      <NoteSection sectionTitle="Physician" value={physician} />
      <NoteSection sectionTitle="Patient" value={patient} />
      {birthdate && <NoteSection sectionTitle="Date of Birth: " value={birthdate} />}
      <NoteSection sectionTitle="Patient" value={patient} />
      {pathway && <NoteSection sectionTitle="Pathway" value={pathway} />}
      {node && <NoteSection sectionTitle="node" value={node} />}
      <NoteSection sectionTitle="Status" value={status} />
      {treatment && <NoteSection sectionTitle="Treatment" value={treatment} />}
      {notes && <NoteSection sectionTitle="node" value={notes} />}
    </div>
  );
};

interface NoteSectionProps {
  sectionTitle: string;
  value: string;
}

const NoteSection: FC<NoteSectionProps> = ({ sectionTitle, value }) => {
  return (
    <div className={styles.noteSection}>
      <b>{sectionTitle}: </b>
      <span>{value}</span>
    </div>
  );
};

export default NoteConfirmationPopup;
