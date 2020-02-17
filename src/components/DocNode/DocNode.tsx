import React, { FC, ReactNode, ReactElement, useState } from 'react';
import { GuidanceState, DocumentationResource, State } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './DocNode.module.scss';
import indexStyles from 'styles/index.module.scss';
import { isBranchState } from 'utils/nodeUtils';

interface DocNodeProps {
  pathwayState: GuidanceState | State;
  isActionable: boolean;
  isGuidance: boolean;
  documentation: DocumentationResource | undefined;
}

const DocNode: FC<DocNodeProps> = ({ pathwayState, isActionable, isGuidance, documentation }) => {
  const [comments, setComments] = useState<string>('');

  const guidance = isGuidance && renderGuidance(pathwayState as GuidanceState, documentation);
  const branch = isBranchState(pathwayState) && renderBranch(documentation);

  const defaultText =
    `The patient and I discussed the treatment plan, ` +
    `risks, benefits and alternatives.  The patient ` +
    `expressed understanding and wants to proceed.`;

  return (
    <div className={indexStyles.docNode}>
      <table className={styles.infoTable}>
        <tbody>{guidance || branch}</tbody>
      </table>
      {isActionable && (
        <form className={styles.commentsForm}>
          <label>Comments:</label>
          <button
            className={indexStyles.button}
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
          <button
            className={`${styles.accept} ${indexStyles.button}`}
            onClick={(e): void => e.preventDefault()}
          >
            Accept
          </button>
          <button
            className={`${styles.decline} ${indexStyles.button}`}
            onClick={(e): void => e.preventDefault()}
          >
            Decline
          </button>
        </form>
      )}
    </div>
  );
};

type DocNodeFieldProps = {
  title: string;
  description: ReactNode;
};

const DocNodeField: FC<DocNodeFieldProps> = ({ title, description }) => {
  return (
    <tr>
      <td className={styles.descTitle}>{title}</td>
      <td className={styles.desc}>{description}</td>
    </tr>
  );
};

function renderBranch(documentation: DocumentationResource | undefined): ReactElement[] {
  const returnElements: ReactElement[] = [];

  if (documentation?.resource) {
    switch (documentation.resourceType) {
      case 'Observation': {
        const observation = documentation.resource as fhir.Observation;

        const valueCoding = observation.valueCodeableConcept?.coding;
        valueCoding &&
          returnElements.push(
            <DocNodeField
              key="ValueSystem"
              title="System"
              description={
                <>
                  {valueCoding[0].system}
                  <a href={valueCoding[0].system} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon="external-link-alt" className={styles.externalLink} />
                  </a>
                </>
              }
            />,
            <DocNodeField key="ValueCode" title="Code" description={valueCoding[0].code} />,
            <DocNodeField key="ValueDisplay" title="Display" description={valueCoding[0].display} />
          );

        const date = observation.effectiveDateTime;
        date &&
          returnElements.push(
            <DocNodeField
              key="Date"
              title="Date"
              description={
                new Date(date).toLocaleDateString('en-us') +
                ' ' +
                new Date(date).toLocaleTimeString('en-us')
              }
            />
          );
      }
    }
  } else {
    returnElements.push(
      <DocNodeField
        key="value"
        title="Value"
        description={
          <>
            missing data
            <a href={'example.com'} rel="noopener noreferrer">
              <FontAwesomeIcon icon="edit" className={styles.externalLink} />
            </a>
          </>
        }
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
    <DocNodeField key="Notes" title="Notes" description={pathwayState.action[0].description} />,
    <DocNodeField key="Type" title="Type" description={resource.resourceType} />,
    <DocNodeField
      key="System"
      title="System"
      description={
        <>
          {coding[0].system}
          <a href={coding[0].system} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon="external-link-alt" className={styles.externalLink} />
          </a>
        </>
      }
    />,
    <DocNodeField key="Code" title="Code" description={coding[0].code} />,
    <DocNodeField key="Display" title="Display" description={coding[0].display} />
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
            <DocNodeField
              key="Start"
              title="Start"
              description={new Date(start).toLocaleDateString('en-us')}
            />
          );
        }

        if (end) {
          returnElements.push(
            <DocNodeField
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

export default DocNode;
