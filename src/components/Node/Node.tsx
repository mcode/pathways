import React, { FC } from 'react';
import { State } from 'pathways-model';

import classes from './Node.module.scss';

interface NodeProps {
  icon: string;
  pathwayState: State;
  isOnPatientPath: boolean;
  xCoordinate: number;
  yCoordinate: number;
}

const Node: FC<NodeProps> = ({ icon, pathwayState, isOnPatientPath, xCoordinate, yCoordinate }) => {
  const { label } = pathwayState;
  const style = {
    top: yCoordinate,
    left: xCoordinate
  };

  const backgroundColorClass = isOnPatientPath ? classes.onPatientPath : classes.notOnPatientPath;

  return (
    <div className={`${classes.node} ${backgroundColorClass}`} style={style}>
      <img className={classes.icon} src={icon} alt="icon" />
      {label}
    </div>
  );
};

export default Node;
