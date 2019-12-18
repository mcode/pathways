import React, { FC } from 'react';
import { GuidanceState } from 'pathways-model';

import classes from './RecNode.module.scss';

interface RecNodeProps {
  pathwayState: GuidanceState;
}

const RecNode: FC<RecNodeProps> = ({ pathwayState }) => {
  if (pathwayState.action.length === 0)
    return <div className={`${classes.recNode}`}>No actions</div>;

  const resource = pathwayState.action[0].resource;
  const coding =
    'medicationCodeableConcept' in resource
      ? resource.medicationCodeableConcept.coding
      : resource.code.coding;

  return (
    <div className={`${classes.recNode}`}>
      <table className={`${classes.infoTable}`}>
        <tbody>
          <tr>
            <td className={`${classes.descTitle}`}>Notes</td>
            <td className={`${classes.desc}`}>{pathwayState.action[0].description}</td>
          </tr>
          <tr>
            <td className={`${classes.descTitle}`}>Type</td>
            <td className={`${classes.desc}`}>{resource.resourceType}</td>
          </tr>
          <tr>
            <td className={`${classes.descTitle}`}>System</td>
            <td className={`${classes.desc}`}>{coding[0].system}</td>
          </tr>
          <tr>
            <td className={`${classes.descTitle}`}>Code</td>
            <td className={`${classes.desc}`}>{coding[0].code}</td>
          </tr>
          <tr>
            <td className={`${classes.descTitle}`}>Display</td>
            <td className={`${classes.desc}`}>{coding[0].display}</td>
          </tr>
        </tbody>
      </table>
      <form className={`${classes.commentsForm}`}>
        <label>Comments:</label>
        <button onClick={e => e.preventDefault()}>Use Default Text</button>
        <textarea className={`${classes.comments}`}></textarea>
        <button className={`${classes.acceptButton}`} onClick={e => e.preventDefault()}>
          Accept
        </button>
        <button className={`${classes.declineButton}`} onClick={e => e.preventDefault()}>
          Decline
        </button>
      </form>
    </div>
  );
};

export default RecNode;
