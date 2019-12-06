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
    backgroundColor: isOnPatientPath ? 'rgb(155, 155, 155)' : 'rgb(121, 185, 185)',
    top: yCoordinate,
    left: xCoordinate
  };

  return (
    <div className={classes.node} style={style}>
      <img className={classes.icon} src={icon} alt="icon" />
      {text}
    </div>
  );
};

export default Node;
