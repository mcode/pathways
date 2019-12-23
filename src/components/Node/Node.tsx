import React, { FC } from 'react';
import { GuidanceState, State } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import classes from './Node.module.scss';
import nodeClasses from 'styles/index.module.scss';
import RecNode from 'components/RecNode';

interface NodeProps {
  pathwayState: State;
  isOnPatientPath: boolean;
  isCurrentNode: boolean;
  xCoordinate: number;
  yCoordinate: number;
}

interface NodeIconProps {
  pathwayState: State;
}

const Node: FC<NodeProps> = ({
  pathwayState,
  isOnPatientPath,
  isCurrentNode,
  xCoordinate,
  yCoordinate
}) => {
  const { label } = pathwayState;
  const style = {
    top: yCoordinate,
    left: xCoordinate
  };

  const backgroundColorClass = isOnPatientPath ? classes.onPatientPath : classes.notOnPatientPath;
  const nodeExpandedClass = isCurrentNode ? nodeClasses.expanded : '';
  const currentNodeClass = isCurrentNode ? classes.current : '';

  return (
    <div
      className={`${classes.node} ${backgroundColorClass} ${nodeExpandedClass} ${currentNodeClass}`}
      style={style}
    >
      <div className={nodeClasses.nodeTitle}>
        <NodeIcon pathwayState={pathwayState} />
        {label}
      </div>
      {isGuidanceState(pathwayState) ? (
        <RecNode pathwayState={pathwayState as GuidanceState} />
      ) : null}
    </div>
  );
};

const NodeIcon: FC<NodeIconProps> = ({ pathwayState }) => {
  if (pathwayState.label === 'Start')
    return <FontAwesomeIcon icon="play" className={classes.icon} />;
  if (pathwayState.hasOwnProperty('action')) {
    const guidancePathwayState = pathwayState as GuidanceState;
    if (guidancePathwayState.action.length > 0) {
      const resourceType = guidancePathwayState.action[0].resource.resourceType;
      if (resourceType === 'MedicationRequest')
        return <FontAwesomeIcon icon="prescription-bottle-alt" className={classes.icon} />;
      else if (resourceType === 'MedicationAdministration')
        return <FontAwesomeIcon icon="capsules" className={classes.icon} />;
      else if (resourceType === 'Procedure')
        return <FontAwesomeIcon icon="syringe" className={classes.icon} />;
    }
  }
  return <FontAwesomeIcon icon="microscope" className={classes.icon} />;
};

function isGuidanceState(state: State): boolean {
  return 'action' in state;
}

export default Node;
