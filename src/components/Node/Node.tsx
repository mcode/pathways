import React, { FC } from 'react';
import { GuidanceState, State } from 'pathways-model';

import classes from './Node.module.scss';
import RecNode from 'components/RecNode';

interface NodeProps {
  icon: string;
  pathwayState: State;
  isOnPatientPath: boolean;
  isExpanded: boolean;
  xCoordinate: number;
  yCoordinate: number;
}

const Node: FC<NodeProps> = ({
  icon,
  pathwayState,
  isOnPatientPath,
  isExpanded,
  xCoordinate,
  yCoordinate
}) => {
  const { label } = pathwayState;
  const style = {
    top: yCoordinate,
    left: xCoordinate
  };

  const backgroundColorClass = isOnPatientPath ? classes.onPatientPath : classes.notOnPatientPath;
  const nodeExpandedClass = isExpanded ? 'nodeExpanded' : '';

  return (
    <div className={`${classes.node} ${backgroundColorClass} ${nodeExpandedClass}`} style={style}>
      <div className="nodeTitle">
        <img className={classes.icon} src={icon} alt="icon" />
        {label}
      </div>
      {isGuidanceState(pathwayState) ? (
        <RecNode pathwayState={pathwayState as GuidanceState} />
      ) : null}
    </div>
  );
};

function isGuidanceState(state: State): boolean {
  return 'action' in state;
}

export default Node;
