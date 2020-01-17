import React, { FC, ReactNode } from 'react';
import { GuidanceState } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import classes from './RecNode.module.scss';
import indexClasses from 'styles/index.module.scss';

interface RecNodeProps {
  pathwayState: GuidanceState;
  isCurrentNode: boolean;
}

const RecNode: FC<RecNodeProps> = ({ pathwayState, isCurrentNode }) => {
  const resource = pathwayState.action[0].resource;
  const coding =
    'medicationCodeableConcept' in resource
      ? resource.medicationCodeableConcept.coding
      : resource.code.coding;

  return (
    <div className={indexClasses.recNode}>
      <table className={classes.infoTable}>
        <tbody>
          <RecNodeField title="Notes" description={pathwayState.action[0].description} />
          <RecNodeField title="Type" description={resource.resourceType} />
          <RecNodeField
            title="System"
            description={
              <>
                {coding[0].system}
                <a href={coding[0].system} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon="external-link-alt" className={classes.externalLink} />
                </a>
              </>
            }
          />
          <RecNodeField title="Code" description={coding[0].code} />
          <RecNodeField title="Display" description={coding[0].display} />
        </tbody>
      </table>
      {isCurrentNode ? (
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
      ) : null}
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

export default RecNode;
