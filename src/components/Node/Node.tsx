import React, { FC } from 'react';

import classes from './Node.module.scss';

interface NodeProps {
  icon: string;
  text: string;
  xCoordinate: number;
  yCoordinate: number;
}

const Node: FC<NodeProps> = ({ icon, text, xCoordinate, yCoordinate }) => {
  const style = {
    top: yCoordinate,
    left: xCoordinate
  };

  return (
    <div className={classes.node} style={style}>
      {/* Insert icon */}
      <img className={classes.icon} src={icon} alt="icon"/>
      {text}
    </div>
  );
};

export default Node;
