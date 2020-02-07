import React, { FC, ReactNode, ReactElement } from 'react';
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
  const guidance = isGuidance && renderGuidance(pathwayState as GuidanceState, documentation);
  const branch = !isGuidance && renderBranch(pathwayState, documentation);

  return (
    <div className={indexClasses.ExpandedNode}>
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

function renderBranch(
  pathwayState: State,
  documentation: DocumentationResource | undefined
): ReactElement[] {
  const returnElements: ReactElement[] = [];
  switch (
    documentation?.resourceType // TODO: update this to not use documentation
  ) {
    case 'Observation': {
      returnElements.push(
        <ExpandedNodeField key="Type" title="Type" description="Observation" />,
        <ExpandedNodeField
          key="ResourceSystem"
          title="System"
          description={
            <>
              {'example.com'}
              <a href={'example.com'} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon="external-link-alt" className={classes.externalLink} />
              </a>
            </>
          }
        />,
        <ExpandedNodeField key="ResourceCode" title="Code" description={'1234'} />,
        <ExpandedNodeField key="ResourceDisplay" title="Display" description={'Sample'} />
      );

      if (documentation?.resource) {
        returnElements.push(<hr />);
        const observation = documentation.resource as fhir.Observation;

        returnElements.push(<ExpandedNodeField key="ID" title="ID" description={observation.id} />);

        const date = observation.effectiveDateTime;
        console.log(date);
        date &&
          returnElements.push(
            <ExpandedNodeField
              key="Date"
              title="Date"
              // TODO: include the date on this
              description={new Date(date).toLocaleTimeString('en-us')}
            />
          );

        const coding = observation.valueCodeableConcept?.coding;
        coding &&
          returnElements.push(
            <ExpandedNodeField
              key="ValueSystem"
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
            <ExpandedNodeField key="ValueCode" title="Code" description={coding[0].code} />,
            <ExpandedNodeField key="ValueDisplay" title="Display" description={coding[0].display} />
          );
      }
    }
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
