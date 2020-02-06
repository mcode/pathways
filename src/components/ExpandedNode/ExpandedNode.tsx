import React, { FC, ReactNode, ReactElement, useState } from 'react';
import { GuidanceState, DocumentationResource, State } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import classes from './ExpandedNode.module.scss';
import indexClasses from 'styles/index.module.scss';

interface ExpandedNodeProps {
  pathwayState: GuidanceState | State;
  isActionable: boolean;
  documentation: DocumentationResource | undefined;
  isGuidance: boolean;
}

const ExpandedNode: FC<ExpandedNodeProps> = ({
  pathwayState,
  isActionable,
  documentation,
  isGuidance
}) => {
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
    <div className={indexClasses.ExpandedNode}>
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

type ExpandedNodeFieldProps = {
  title: string;
  description: ReactNode;
};

const ExpandedNodeField: FC<ExpandedNodeFieldProps> = ({ title, description }) => {
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
            <FontAwesomeIcon icon="external-link-alt" className={classes.externalLink} />
          </a>
        </>
      }
    />,
    <ExpandedNodeField key="Code" title="Code" description={coding[0].code} />,
    <ExpandedNodeField key="Display" title="Display" description={coding[0].display} />
  ];
}
function parseResource(resource: fhir.DomainResource): ReactElement[] {
  const returnValue: ReactElement[] = [];
  switch (resource.resourceType) {
    case 'Procedure': {
      const procedure = resource as fhir.Procedure;
      const start =
        (procedure.performedPeriod && procedure.performedPeriod.start) ||
        procedure.performedDateTime;
      const end = procedure.performedPeriod && procedure.performedPeriod.end;
      if (start) {
        returnValue.push(
          <ExpandedNodeField
            key="Start"
            title="Start"
            description={new Date(start).toLocaleDateString('en-us')}
          />
        );
      }

      if (end) {
        returnValue.push(
          <ExpandedNodeField
            key="End"
            title="End"
            description={new Date(end).toLocaleDateString('en-us')}
          />
        );
      }
      break;
    }
    case 'Observation': {
      const observation = resource as fhir.Observation;
      const date = observation.effectiveDateTime;
      date &&
        returnValue.push(
          <ExpandedNodeField
            key="Date"
            title="Date"
            description={new Date(date).toLocaleTimeString('en-us')}
          />
        );
    }
  }

  return returnValue;
}

export default ExpandedNode;
