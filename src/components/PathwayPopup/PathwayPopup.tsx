import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Popup } from 'semantic-ui-react';
import classes from './PathwayPopup.module.scss';
import nodeClasses from '../ExpandedNode/ExpandedNode.module.scss';

interface PathwayPopupProps {
  name?: string;
}
const PathwayPopup: FC<PathwayPopupProps> = ({ name }) => {
  return (
    <Popup
      content={<PopupContent values={['N1', 'N0', 'N+']}></PopupContent>}
      position="bottom right"
      className={classes.pathwayPopup}
      on="click"
      pinned
      trigger={
        <div className={classes.popupWrapper}>
          missing data
          <FontAwesomeIcon icon="edit" className={nodeClasses.externalLink} />
        </div>
      }
    />
  );
};

interface PopupContentProps {
  values: Array<string>;
}

const PopupContent: FC<PopupContentProps> = ({ values }) => {
  return (
    <div>
      <div className={classes.popupContent}>
        Select Value:
        <div>
          {values.map(e => {
            return <div className={classes.popupChoice}>{e}</div>;
          })}
        </div>
      </div>
      <div className={classes.footer}>
        <FontAwesomeIcon icon={faTimes} />
      </div>
    </div>
  );
};
export default PathwayPopup;
