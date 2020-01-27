import React, { FC, ReactNode, ReactElement, useState } from 'react';
import { GuidanceState, DocumentationResource, State } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import classes from './RecNode.module.scss';
import indexClasses from 'styles/index.module.scss';

interface RecNodeProps {
  pathwayState: GuidanceState | State;
  isActionable: boolean;
  documentation: DocumentationResource | undefined;
  isGuidance: boolean;
}

const RecNode: FC<RecNodeProps> = ({ pathwayState, isActionable, documentation, isGuidance }) => {
  const [comments, setComments] = useState<string>('');
  const resource = pathwayState.action[0].resource;
  const defaultText =
    `The patient and I discussed the treatment plan, ` +
    `risks, benefits and alternatives.  The patient ` +
    `expressed understanding and wants to proceed.`;
  const coding =
    'medicationCodeableConcept' in resource
      ? resource.medicationCodeableConcept.coding
      : resource.code.coding;
  let fhirFields: ReactElement[] = [];
  if (documentation && documentation.resource) {
    fhirFields = parseResource(documentation.resource);
  }
  const guidance = isGuidance && renderRecGuidance(pathwayState as GuidanceState);

  return (
    <div className={indexClasses.recNode}>
      <table className={classes.infoTable}>
        <tbody>
          {guidance}
          {fhirFields}
        </tbody>
      </table>
      {isActionable && (
        <form className={classes.commentsForm}>
          <label>Comments:</label>
          <button
            className={indexClasses.button}
            onClick={(e): void => {
              e.preventDefault();
              if (!comments.includes(defaultText)) setComments(comments + defaultText);
            }}
          >
            Use Default Text
          </button>
          <textarea
            className={classes.comments}
            value={comments}
            onChange={(e): void => setComments(e.target.value)}
          ></textarea>
          <button
            className={`${classes.accept} ${indexClasses.button}`}
            onClick={(e): void => e.preventDefault()}
          >
            Accept
          </button>
          <button
            className={`${classes.decline} ${indexClasses.button}`}
            onClick={(e): void => e.preventDefault()}
          >
            Decline
          </button>
        </form>
      )}
    </div>
  );
};

type RecNodeFieldProps = {
  title: string;
  description: ReactNode;
};

const RecNodeField: FC<RecNodeFieldProps> = ({ title, description }) => {
  return (
    <tr>
      <td className={classes.descTitle}>{title}</td>
      <td className={classes.desc}>{description}</td>
    </tr>
  );
};

function renderRecGuidance(pathwayState: GuidanceState): ReactElement[] {
  const resource = pathwayState.action[0].resource;
  const coding =
    'medicationCodeableConcept' in resource
      ? resource.medicationCodeableConcept.coding
      : resource.code.coding;
  return [
    <RecNodeField key="Notes" title="Notes" description={pathwayState.action[0].description} />,
    <RecNodeField key="Type" title="Type" description={resource.resourceType} />,
    <RecNodeField
      key="System"
      title="System"
      description={
        <>
          {coding[0].system}
          <a href={coding[0].system} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon="external-link-alt" className={classes.externalLink} />
          </a>
        </>
      }
    />,
    <RecNodeField key="Code" title="Code" description={coding[0].code} />,
    <RecNodeField key="Display" title="Display" description={coding[0].display} />
  ];
}
function parseResource(resource: fhir.DomainResource): ReactElement[] {
  const returnValue: ReactElement[] = [];
  switch (resource.resourceType) {
    case 'Procedure': {
      const procedure = resource as fhir.Procedure;
      const start = procedure.performedPeriod && procedure.performedPeriod.start;
      const end = procedure.performedPeriod && procedure.performedPeriod.end;
      start &&
        returnValue.push(
          <RecNodeField
            key="Start"
            title="Start"
            description={new Date(start).toLocaleDateString('en-us')}
          />
        );
      end &&
        returnValue.push(
          <RecNodeField
            key="End"
            title="End"
            description={new Date(end).toLocaleDateString('en-us')}
          />
        );
      break;
    }
    case 'Observation': {
      const observation = resource as fhir.Observation;
      const date = observation.effectiveDateTime;
      date &&
        returnValue.push(
          <RecNodeField
            key="Date"
            title="Date"
            description={new Date(date).toLocaleTimeString('en-us')}
          />
        );
    }
  }

  return returnValue;
}

export default RecNode;
