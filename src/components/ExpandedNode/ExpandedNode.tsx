import React, { FC, ReactNode, ReactElement, useState, memo } from 'react';
import { GuidanceState, DocumentationResource, State, Action } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MissingDataPopup from 'components/MissingDataPopup';
import styles from './ExpandedNode.module.scss';
import indexStyles from 'styles/index.module.scss';
import ActionButton from 'components/ActionButton';
import ReportModal from 'components/ReportModal';
import { isBranchState } from 'utils/nodeUtils';
import { useFHIRClient } from 'components/FHIRClient';
import { usePatientRecords } from 'components/PatientRecordsProvider';
import { usePatient } from 'components/PatientProvider';
import {
  translatePathwayRecommendation,
  createActionDocumentReference,
  createDocumentReference,
  createNoteContent
} from 'utils/fhirUtils';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@material-ui/core';
import { useNote } from 'components/NoteDataProvider';
import {
  Resource,
  DocumentReference,
  Observation,
  Procedure,
  Identifier,
  MedicationRequest,
  ServiceRequest,
  CarePlan
} from 'fhir-objects';
import { retrieveNote } from 'utils/fhirUtils';

interface ExpandedNodeProps {
  pathwayState: GuidanceState;
  isActionable: boolean;
  isCurrentNode: boolean;
  isGuidance: boolean;
  documentation: DocumentationResource | undefined;
  isAccepted: boolean | null;
}

const ExpandedNode: FC<ExpandedNodeProps> = memo(
  ({ pathwayState, isActionable, isCurrentNode, isGuidance, documentation, isAccepted }) => {
    const { note, setNote } = useNote();
    const [showReport, setShowReport] = useState<boolean>(false);
    const { patientRecords, setPatientRecords } = usePatientRecords();
    const client = useFHIRClient();
    const setComments = (nc: string): void => {
      setNote(prevNote => {
        return { ...prevNote, notes: nc };
      });
    };
    const patient = usePatient().patient as fhir.Patient;
    if (note) note.node = pathwayState.label;

    const onConfirm = (action?: Action[]): void => {
      const newPatientRecords = [...patientRecords];

      // Create DocumentReference and add to patient record(and post to FHIR server)
      if (note) {
        const noteString = createNoteContent(
          note,
          patientRecords,
          note.status,
          note?.notes ?? '',
          pathwayState
        );
        const documentReference = createActionDocumentReference(
          noteString,
          pathwayState.label,
          patient
        );

        newPatientRecords.push(documentReference);
        client?.create?.(documentReference);
      }

      // Translate pathway recommended resource and add to patient record
      if (note?.status === 'Accepted' && action && action.length > 0) {
        const resource: Resource = translatePathwayRecommendation(
          action[0].resource,
          patient.id as string
        );

        newPatientRecords.push(resource);
        client?.create?.(resource);
      }

      setPatientRecords(newPatientRecords);
      setShowReport(false);
    };

    const onAdvance = (): void => {
      const content = `${pathwayState.label} - Advance`;
      const documentReference = createDocumentReference(content, patient);

      client?.create?.(documentReference);
      setPatientRecords([...patientRecords, documentReference]);
    };

    return (
      <>
        <ExpandedNodeMemo
          isGuidance={isGuidance}
          isActionable={isActionable}
          isCurrentNode={isCurrentNode}
          pathwayState={pathwayState}
          documentation={documentation}
          setComments={setComments}
          comments={note?.notes ?? ''}
          onAccept={(): void => {
            setNote(prevNote => {
              return { ...prevNote, status: 'Accepted' };
            });
            setShowReport(true);
          }}
          onDecline={(): void => {
            setNote(prevNote => {
              return { ...prevNote, status: 'Declined' };
            });
            setShowReport(true);
          }}
          isAccepted={isAccepted}
          onAdvance={onAdvance}
        />
        {showReport && (
          <ReportModal
            onConfirm={(): void => onConfirm(pathwayState.action)}
            onDecline={(): void => setShowReport(false)}
          />
        )}
      </>
    );
  }
);

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
  isAccepted: boolean | null;
};

const StatusField: FC<StatusFieldProps> = ({ documentation, isAccepted }) => {
  if (!documentation?.resource) {
    return null;
  }
  const status = documentation.status;
  const rawDate = documentation.resource?.meta?.lastUpdated;
  if (rawDate) {
    const date = new Date(rawDate).toLocaleString('en-us');
    let titleText = '';
    if (isAccepted) {
      titleText = status.charAt(0).toUpperCase() + status.slice(1);
    } else if (isAccepted === null) {
      titleText = 'Status';
    } else {
      titleText = 'Declined';
    }
    return (
      <ExpandedNodeField
        key="Status"
        title={titleText}
        description={isAccepted ? date : date.concat(' by Dr. Example')}
      />
    );
  }
  return null;
};

function renderBranch(
  documentation: DocumentationResource | undefined,
  pathwayState: State,
  isAccepted: boolean | null
): ReactElement[] {
  const returnElements: ReactElement[] = [];

  if (documentation?.resource) {
    switch (documentation.resourceType) {
      case 'Observation': {
        const observation = documentation.resource as Observation;

        const valueCoding = observation.valueCodeableConcept?.coding;
        if (valueCoding) {
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
        }

        const date = observation.effectiveDateTime;
        if (date) {
          returnElements.push(
            <ExpandedNodeField
              key="Date"
              title="Date"
              description={new Date(date).toLocaleString('en-us')}
            />
          );
        }
        break;
      }
      case 'DocumentReference': {
        const documentReference = documentation.resource as DocumentReference;
        const subject = documentReference.subject;
        if (subject)
          returnElements.push(
            <ExpandedNodeField key="subject" title="Subject" description={subject.reference} />
          );

        // Display missing data value if it is available, otherwise display note content
        const identifierArray: Identifier[] | undefined = documentReference.identifier;
        const documentReferenceIdentifier = identifierArray?.find(
          i => i.system === 'pathways.documentreference'
        );

        if (documentReferenceIdentifier) {
          const value = atob(documentReferenceIdentifier.value as string);
          returnElements.push(<ExpandedNodeField key="value" title="Value" description={value} />);
        } else {
          const note = documentReference.content[0].attachment.data;
          if (note)
            returnElements.push(
              <ExpandedNodeField key="note" title="Note" description={atob(note)} />
            );
        }
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

function isMedicationRequest(
  request: MedicationRequest | ServiceRequest
): request is MedicationRequest {
  return (request as MedicationRequest).medicationCodeableConcept !== undefined;
}
function renderGuidance(
  pathwayState: GuidanceState,
  documentation: DocumentationResource | undefined,
  isAccepted: boolean | null
): ReactElement[] {
  const resource = pathwayState.action[0].resource;
  const coding = isMedicationRequest(resource)
    ? resource?.medicationCodeableConcept?.coding
    : resource?.code?.coding;

  const returnElements = [
    <ExpandedNodeField
      key="Description"
      title="Description"
      description={pathwayState.action[0].description}
    />,
    <ExpandedNodeField key="Type" title="Type" description={resource.resourceType} />
  ];

  if (coding) {
    const elements = [
      <ExpandedNodeField
        key="System"
        title="System"
        description={
          <>
            {coding && coding[0].system}
            <a href={coding && coding[0].system} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faExternalLinkAlt} className={styles.externalLink} />
            </a>
          </>
        }
      />,
      <ExpandedNodeField key="Code" title="Code" description={coding && coding[0].code} />,
      <ExpandedNodeField key="Display" title="Display" description={coding && coding[0].display} />
    ];
    returnElements.push(...elements);
  }
  if (documentation?.resource) {
    switch (documentation.resourceType) {
      case 'Procedure': {
        const procedure = documentation.resource as Procedure;
        const start =
          (procedure.performedPeriod && procedure.performedPeriod.start) ||
          procedure.performedDateTime;
        const end = procedure.performedPeriod && procedure.performedPeriod.end;
        if (start) {
          returnElements.push(
            <ExpandedNodeField
              key="Start"
              title="Start"
              description={new Date(start).toLocaleString('en-us')}
            />
          );
        }

        if (end) {
          returnElements.push(
            <ExpandedNodeField
              key="End"
              title="End"
              description={new Date(end).toLocaleString('en-us')}
            />
          );
        }
        break;
      }
      case 'CarePlan': {
        const plan = documentation.resource as CarePlan;
        const title = plan.title;
        if (title) {
          returnElements.push(<ExpandedNodeField key="Title" title="Title" description={title} />);
        }
      }
    }
  }
  return returnElements;
}

interface ExpandedNodeMemoProps {
  documentation: DocumentationResource | undefined;
  pathwayState: GuidanceState;
  isGuidance: boolean;
  isActionable: boolean;
  isCurrentNode: boolean;
  comments: string;
  setComments: (value: string) => void;
  onAccept: () => void;
  onDecline: () => void;
  isAccepted: boolean | null;
  onAdvance: () => void;
}
const ExpandedNodeMemo: FC<ExpandedNodeMemoProps> = memo(
  ({
    documentation,
    pathwayState,
    isGuidance,
    isActionable,
    isCurrentNode,
    comments,
    setComments,
    onAccept,
    onDecline,
    isAccepted,
    onAdvance
  }) => {
    const { patientRecords } = usePatientRecords();
    const guidance = isGuidance && renderGuidance(pathwayState, documentation, isAccepted);
    const branch =
      isBranchState(pathwayState) && renderBranch(documentation, pathwayState, isAccepted);
    const defaultText =
      'The patient and I discussed the treatment plan, risks, benefits and alternatives.  The patient expressed understanding and wants to proceed.';

    let notes;
    const documentReference = retrieveNote(pathwayState.label, patientRecords);
    if (documentReference) {
      const content = documentReference.content[0].attachment?.data;
      if (content) {
        notes = atob(content);
        notes = notes.slice(notes.indexOf('Notes: ') + 7);
      }
    }

    return (
      <div className={indexStyles.expandedNode}>
        <table className={styles.infoTable}>
          <tbody>
            <StatusField documentation={documentation} isAccepted={isAccepted} />
            {guidance || branch}
            {!isActionable && notes && /\S/.test(notes) && (
              <ExpandedNodeField key="Comments" title="Comments" description={notes} />
            )}
          </tbody>
        </table>
        {/* Node is advanceable if it has been accepted or declined */}
        {pathwayState.transitions.length > 0 && !isActionable && isGuidance && isCurrentNode && (
          <Button
            className={`${indexStyles.button} ${styles.button}`}
            variant="contained"
            color="primary"
            onClick={onAdvance}
          >
            Advance
          </Button>
        )}
        {isActionable && isGuidance && (
          <form className={styles.commentsForm}>
            <div>
              <label>Comments:</label>
              <Button
                className={`${indexStyles.button} ${styles.button}`}
                onClick={(e): void => {
                  e.preventDefault();
                  if (!comments.includes(defaultText)) setComments(comments + defaultText);
                }}
                variant="contained"
                color="primary"
              >
                Use Default Text
              </Button>
            </div>
            <textarea
              className={styles.comments}
              value={comments}
              onChange={(e): void => setComments(e.target.value)}
            ></textarea>
            <div className={styles.footer}>
              <ActionButton type="accept" size="large" onClick={onAccept} />
            </div>
            <div className={styles.footer}>
              <ActionButton type="decline" size="large" onClick={onDecline} />
            </div>
          </form>
        )}
      </div>
    );
  }
);

export default ExpandedNode;
