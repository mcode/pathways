import React, { FC, ReactElement, useState } from 'react';
import { Note } from 'components/NoteDataProvider';
import styles from './NoteConfirmationPopup.module.scss';
import PathwayPopup from 'components/PathwayPopup';
import ActionButton from 'components/ActionButton';

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
        <div className={styles.popupContent}>
          <NotePreview {...note} />
          <div className={styles.popupActions}>
            <div>
              The above note will be written into the EHR and any procedure requests will be
              submitted. Proceed?
            </div>
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
      <table>
        <tr>
          <td>
            <NoteSection sectionTitle="Date" value={date} />
          </td>
          <td>
            <NoteSection sectionTitle="Physician" value={physician} />
          </td>
        </tr>
        <tr>
          <td>
            <NoteSection sectionTitle="Patient" value={patient} />
          </td>
          <td>{birthdate && <NoteSection sectionTitle="Date of Birth" value={birthdate} />}</td>
        </tr>
      </table>

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
