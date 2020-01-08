import React, { FC, useEffect, useState } from 'react';
import { GuidanceState, State } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import classes from './Node.module.scss';
import nodeClasses from 'styles/index.module.scss';
import RecNode from 'components/RecNode';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface NodeProps {
  pathwayState: State;
  isOnPatientPath: boolean;
  isCurrentNode: boolean;
  xCoordinate: number;
  yCoordinate: number;
  interactive?: boolean;
}

interface NodeIconProps {
  pathwayState: State;
}

const Node: FC<NodeProps> = ({
  pathwayState,
  isOnPatientPath,
  isCurrentNode,
  xCoordinate,
  yCoordinate,
  interactive = true
}) => {
  const { label } = pathwayState;
  const style = {
    top: yCoordinate,
    left: xCoordinate
  };

  const backgroundColorClass = isOnPatientPath ? classes.onPatientPath : classes.notOnPatientPath;
  const currentNodeClass = isCurrentNode ? classes.current : '';

  const [expanded, setExpanded] = useState<boolean>(false);
  const onClickHandler = interactive ? () => setExpanded(!expanded) : () => {};

  useEffect(() => {
    setExpanded(isCurrentNode);
  }, [isCurrentNode]);

  return (
    <div
      className={`${classes.node} ${backgroundColorClass} ${expanded &&
        nodeClasses.expanded} ${currentNodeClass}`}
      style={style}
      onClick={onClickHandler}
    >
      <div className={nodeClasses.nodeTitle}>
        <NodeIcon pathwayState={pathwayState} />
        {label}
      </div>
      {isGuidanceState(pathwayState) && expanded && (
        <RecNode pathwayState={pathwayState as GuidanceState} />
      )}
    </div>
  );
};

const NodeIcon: FC<NodeIconProps> = ({ pathwayState }) => {
  let icon: IconProp = 'microscope';
  if (pathwayState.label === 'Start') icon = 'play';
  if (isGuidanceState(pathwayState)) {
    const guidancePathwayState = pathwayState as GuidanceState;
    if (guidancePathwayState.action.length > 0) {
      const resourceType = guidancePathwayState.action[0].resource.resourceType;
      if (resourceType === 'MedicationRequest') icon = 'prescription-bottle-alt';
      else if (resourceType === 'MedicationAdministration') icon = 'capsules';
      else if (resourceType === 'Procedure') icon = 'syringe';
    }
  }
  return <FontAwesomeIcon icon={icon} className={classes.icon} />;
};

function isGuidanceState(state: State): boolean {
  return 'action' in state;
}

export default Node;
