import React, { FC } from 'react';

import classes from './Node.module.scss';

interface NodeProps {
  icon: string;
  text: string;
  isOnPatientPath: boolean;
  xCoordinate: number;
  yCoordinate: number;
}

const Node: FC<NodeProps> = ({ icon, text, isOnPatientPath, xCoordinate, yCoordinate }) => {
  const style = {
    top: yCoordinate,
    left: xCoordinate
  };

  const backgroundColorClass = isOnPatientPath ? classes.onPatientPath : classes.notOnPatientPath;

  return (
    <div className={`${classes.node} ${backgroundColorClass}`} style={style}>
      <img className={classes.icon} src={icon} alt="icon" />
      {text}
    </div>
  );
};

export default Node;
