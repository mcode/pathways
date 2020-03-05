import React, { FC, ReactNode, ReactElement, useState } from 'react';
import { GuidanceState, DocumentationResource, State, Action } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MissingDataPopup from 'components/MissingDataPopup';
import styles from './ExpandedNode.module.scss';
import indexStyles from 'styles/index.module.scss';
import { ConfirmedActionButton } from 'components/ConfirmedActionButton';
import { isBranchState } from 'utils/nodeUtils';
import { useFHIRClient } from 'components/FHIRClient';
import { usePatientRecords } from 'components/PatientRecordsProvider';
import { usePatient } from 'components/PatientProvider';
import { translatePathwayRecommendation, createDocumentReference } from 'utils/fhirUtils';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { useNote, Note, toString } from 'components/NoteProvider';
interface ExpandedNodeProps {
  pathwayState: GuidanceState;
  isActionable: boolean;
  isGuidance: boolean;
  documentation: DocumentationResource | undefined;
}

const ExpandedNode: FC<ExpandedNodeProps> = ({
  pathwayState,
  isActionable,
  isGuidance,
  documentation
}) => {
  const [comments, setComments] = useState<string>('');
  const guidance = isGuidance && renderGuidance(pathwayState, documentation);
  const branch = isBranchState(pathwayState) && renderBranch(documentation, pathwayState);
  const { patientRecords, setPatientRecords } = usePatientRecords();
  const client = useFHIRClient();
  const note = useNote();
  const patient = usePatient();

  // prettier-ignore
  const defaultText = 'The patient and I discussed the treatment plan, risks, benefits and alternatives.  The patient expressed understanding and wants to proceed.';
  const onConfirm = (status: string, action: Action[]): void => {
    const newPatientRecords = [...patientRecords];

    // Create DocumentReference and add to patient record(and post to FHIR server)
    if (note) {
      const noteString = gatherInfo(note, patientRecords, status, comments, pathwayState);
      const documentReference = createDocumentReference(noteString, pathwayState.label, patient);
      newPatientRecords.push(documentReference);
      client?.create?.(documentReference);
    }

    // Translate pathway recommended resource and add to patient record
    if (action.length > 0) {
      const resource: fhir.Resource = translatePathwayRecommendation(
        action[0].resource,
        patient.id as string
      );

      newPatientRecords.push(resource);
      client?.create?.(resource);
    }

    setPatientRecords(newPatientRecords);
  };

  return (
    <div className={indexStyles.expandedNode}>
      <table className={styles.infoTable}>
        <tbody>
          <StatusField documentation={documentation} />
          {guidance || branch}
        </tbody>
      </table>
      {isActionable && isGuidance && (
        <form className={styles.commentsForm}>
          <label>Comments:</label>
          <button
            className={`${indexStyles.button} ${styles.defaultTextButton}`}
            onClick={(e): void => {
              e.preventDefault();
              if (!comments.includes(defaultText)) setComments(comments + defaultText);
            }}
          >
            Use Default Text
          </button>
          <textarea
            className={styles.comments}
            value={comments}
            onChange={(e): void => setComments(e.target.value)}
          ></textarea>
          <div className={styles.footer}>
            <ConfirmedActionButton
              type="accept"
              size="large"
              onConfirm={(): void => {
                onConfirm('Accepted', pathwayState.action);
              }}
            />
          </div>
          <div className={styles.footer}>
            <ConfirmedActionButton
              type="decline"
              size="large"
              onConfirm={(): void => {
                onConfirm('Declined', []);
              }}
            />
          </div>
        </form>
      )}
    </div>
  );
};

type ExpandedNodeFieldProps = {
  title: string;
  description: ReactNode;
};

const ExpandedNodeField: FC<ExpandedNodeFieldProps> = ({ title, description }) => {
  return (
    <tr>
      <td className={styles.descTitle}>{title}</td>
      <td className={styles.desc}>{description}</td>
    </tr>
  );
};

type StatusFieldProps = {
  documentation: DocumentationResource | undefined;
};

const StatusField: FC<StatusFieldProps> = ({ documentation }) => {
  if (!documentation?.resource) {
    return null;
  }
  const status = documentation.status;
  const rawDate = documentation.resource?.meta?.lastUpdated;
  const date = rawDate && new Date(rawDate).toLocaleString('en-us');
  return <ExpandedNodeField key="Status" title={status} description={date} />;
};

function renderBranch(
  documentation: DocumentationResource | undefined,
  pathwayState: State
): ReactElement[] {
  const returnElements: ReactElement[] = [];

  if (documentation?.resource) {
    switch (documentation.resourceType) {
      case 'Observation': {
        const observation = documentation.resource as fhir.Observation;

        const valueCoding = observation.valueCodeableConcept?.coding;
        valueCoding &&
          returnElements.push(
            <ExpandedNodeField
              key="ValueSystem"
              title="System"
              description={
                <>
                  {valueCoding[0].system}
                  <a href={valueCoding[0].system} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faExternalLinkAlt} className={styles.externalLink} />
                  </a>
                </>
              }
            />,
            <ExpandedNodeField key="ValueCode" title="Code" description={valueCoding[0].code} />,
            <ExpandedNodeField
              key="ValueDisplay"
              title="Display"
              description={valueCoding[0].display}
            />
          );

        const date = observation.effectiveDateTime;
        date &&
          returnElements.push(
            <ExpandedNodeField
              key="Date"
              title="Date"
              description={
                new Date(date).toLocaleDateString('en-us') +
                ' ' +
                new Date(date).toLocaleTimeString('en-us')
              }
            />
          );
        break;
      }
      case 'DocumentReference': {
        const documentReference = documentation.resource as fhir.DocumentReference;

        const subject = documentReference.subject;
        subject &&
          returnElements.push(
            <ExpandedNodeField key="subject" title="Subject" description={subject.reference} />
          );

        const note = documentReference.content[0].attachment.data;
        note &&
          returnElements.push(
            <ExpandedNodeField key="note" title="Note" description={atob(note)} />
          );
        break;
      }
      default: {
        returnElements.push(
          <ExpandedNodeField key="error" title="Error" description="Unsupported Resource Type" />
        );
      }
    }
  } else {
    const values: string[] = pathwayState.transitions
      .map(transition => {
        const description = transition.condition?.description;
        return description ? description : '';
      })
      // Remove duplicate values
      .filter((v, i, arr) => arr.indexOf(v) === i);

    returnElements.push(
      <ExpandedNodeField
        key="value"
        title="Value"
        description={<MissingDataPopup values={values} />}
      />
    );
  }
  return returnElements;
}

function renderGuidance(
  pathwayState: GuidanceState,
  documentation: DocumentationResource | undefined
): ReactElement[] {
  const resource = pathwayState.action[0].resource;
  const coding =
    'medicationCodeableConcept' in resource
      ? resource.medicationCodeableConcept.coding
      : resource.code.coding;
  const returnElements = [
    <ExpandedNodeField
      key="Notes"
      title="Notes"
      description={pathwayState.action[0].description}
    />,
    <ExpandedNodeField key="Type" title="Type" description={resource.resourceType} />,
    <ExpandedNodeField
      key="System"
      title="System"
      description={
        <>
          {coding[0].system}
          <a href={coding[0].system} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faExternalLinkAlt} className={styles.externalLink} />
          </a>
        </>
      }
    />,
    <ExpandedNodeField key="Code" title="Code" description={coding[0].code} />,
    <ExpandedNodeField key="Display" title="Display" description={coding[0].display} />
  ];

  if (documentation?.resource) {
    switch (documentation.resourceType) {
      case 'Procedure': {
        const procedure = documentation.resource as fhir.Procedure;
        const start =
          (procedure.performedPeriod && procedure.performedPeriod.start) ||
          procedure.performedDateTime;
        const end = procedure.performedPeriod && procedure.performedPeriod.end;
        if (start) {
          returnElements.push(
            <ExpandedNodeField
              key="Start"
              title="Start"
              description={new Date(start).toLocaleDateString('en-us')}
            />
          );
        }

        if (end) {
          returnElements.push(
            <ExpandedNodeField
              key="End"
              title="End"
              description={new Date(end).toLocaleDateString('en-us')}
            />
          );
        }
        break;
      }
    }
  }
  return returnElements;
}

function gatherInfo(
  note: Note,
  patientRecords: fhir.DomainResource[],
  status: string,
  notes: string,
  pathwayState: GuidanceState
): string {
  note.status = status;
  note.notes = notes;
  note.treatment = pathwayState.action[0].description;
  note.node = pathwayState.label;

  const tnm: string[] = ['', '', ''];
  patientRecords.forEach(record => {
    // TODO: should use code bindings over
    // profile names.
    if (record.meta?.profile && record.meta.profile.length) {
      const elements = [
        'TNMClinicalPrimaryTumorCategory',
        'TNMClinicalRegionalNodesCategory',
        'TNMClinicalDistantMetastasesCategory'
      ];

      const profile = record.meta.profile[0];
      if (record.resourceType === 'Observation') {
        if (profile.includes('TumorMarkerTest') && record.resourceType === 'Observation') {
          const obs = record as fhir.Observation;
          const value = obs.valueCodeableConcept?.text;
          const name = obs.code.text;
          if (value && name) {
            note.mcodeElements[name] = value;
          }
        } else if (
          elements.some(value => {
            return profile.includes(value);
          })
        ) {
          const index = elements.findIndex(value => {
            return profile.includes(value);
          });
          if (index > -1) {
            const obs = record as fhir.Observation;
            const value = obs.valueCodeableConcept?.text;
            if (value) {
              tnm[index] = value;
            }
          }
        }
      }
    }
  });

  note.mcodeElements['Clinical TNM'] = tnm.join(' ');
  return toString(note);
}

export default ExpandedNode;
