import React, { FC } from 'react';
import classes from '../ExpandedNode/ExpandedNode.module.scss';
import indexClasses from '../../styles/index.module.scss';
import withConfirmationPopup from '../withPopup/withConfirmationPopup';

const ActionButton: FC<{ type: 'accept' | 'decline' }> = ({ type }) => {
  return (
    <button className={`${classes[type]} ${indexClasses.button}`} type="button">
      {type[0].toUpperCase() + type.slice(1)}
    </button>
  );
};

const ConfirmedActionButton: FC<{ type: 'accept' | 'decline' }> = withConfirmationPopup(
  ActionButton
);

export default ActionButton;
export { ConfirmedActionButton };
