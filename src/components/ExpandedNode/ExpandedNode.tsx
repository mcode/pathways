import React, { FC, ReactNode, ReactElement } from 'react';
import { GuidanceState, DocumentationResource, State } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import classes from './ExpandedNode.module.scss';
import indexClasses from 'styles/index.module.scss';
import { isGuidanceState, isBranchState } from 'utils/nodeUtils';

interface ExpandedNodeProps {
  pathwayState: GuidanceState | State;
  isActionable: boolean;
  documentation: DocumentationResource | undefined;
}

const ExpandedNode: FC<ExpandedNodeProps> = ({ pathwayState, isActionable, documentation }) => {
  const guidance =
    isGuidanceState(pathwayState) && renderGuidance(pathwayState as GuidanceState, documentation);
  const branch = isBranchState(pathwayState) && renderBranch(documentation);

  return (
    <div className={indexClasses.expandedNode}>
      <table className={classes.infoTable}>
        <tbody>{guidance || branch}</tbody>
      </table>
      {isActionable && (
        <form className={classes.commentsForm}>
          <label>Comments:</label>
          <button className={indexClasses.button} onClick={(e): void => e.preventDefault()}>
            Use Default Text
          </button>
          <textarea className={classes.comments}></textarea>
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

function renderBranch(documentation: DocumentationResource | undefined): ReactElement[] {
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
                    <FontAwesomeIcon icon="external-link-alt" className={classes.externalLink} />
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
      }
    }
  } else {
    returnElements.push(
      <ExpandedNodeField
        key="value"
        title="Value"
        description={
          <>
            missing data
            <a href={'example.com'} rel="noopener noreferrer">
              <FontAwesomeIcon icon="edit" className={classes.externalLink} />
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

export default ExpandedNode;
