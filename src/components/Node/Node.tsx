import React, { FC, Ref, forwardRef, memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { GuidanceNode, PathwayNode, DocumentationResource } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './Node.module.scss';
import nodeStyles from 'styles/index.module.scss';
import ExpandedNode from 'components/ExpandedNode';
import { isGuidanceNode } from 'utils/nodeUtils';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faMicroscope,
  faPlay,
  faPrescriptionBottleAlt,
  faSyringe,
  faCheckCircle,
  faTimesCircle,
  faBookMedical
} from '@fortawesome/free-solid-svg-icons';

const useStyles = makeStyles(
  theme => ({
    'not-on-patient-path': {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary
    },
    'child-not-on-patient-path': {
      borderColor: theme.palette.background.default
    }
  }),
  { name: 'Node' }
);

interface NodeProps {
  pathwayNode: PathwayNode;
  documentation: DocumentationResource | undefined;
  isOnPatientPath: boolean;
  isCurrentNode: boolean;
  xCoordinate: number;
  yCoordinate: number;
  expanded?: boolean;
  onClickHandler?: () => void;
}

const Node: FC<NodeProps & { ref: Ref<HTMLDivElement> }> = memo(
  forwardRef<HTMLDivElement, NodeProps>(
    (
      {
        pathwayNode,
        documentation,
        isOnPatientPath,
        isCurrentNode,
        xCoordinate,
        yCoordinate,
        expanded = false,
        onClickHandler
      },
      ref
    ) => {
      const { label } = pathwayNode;
      const style = {
        top: yCoordinate,
        left: xCoordinate
      };
      const classes = useStyles();
      const backgroundColorClass = isOnPatientPath
        ? styles.onPatientPath
        : clsx(styles.notOnPatientPath, classes['not-on-patient-path']);
      const isActionable = isCurrentNode && !documentation;
      const topLevelClasses = [styles.node, backgroundColorClass];
      let expandedNodeClass = '';
      if (expanded) topLevelClasses.push(nodeStyles.expanded);
      if (isActionable) {
        topLevelClasses.push(styles.actionable);
        expandedNodeClass = styles.childActionable;
      } else {
        expandedNodeClass = isOnPatientPath
          ? styles.childOnPatientPath
          : clsx(styles.childNotOnPatientPath, classes['child-not-on-patient-path']);
      }

      const isGuidance = isGuidanceNode(pathwayNode);
      // TODO: how do we determine whether a node has been accepted or declined?
      // for now:
      // if it's a non-actionable guidance node on the path: accepted == has documentation
      // if it's actionable, not guidance or not on the path: null
      const wasActionTaken = isOnPatientPath && isGuidance && !isActionable;
      const isAccepted = wasActionTaken
        ? documentation?.resourceType !== 'DocumentReference'
        : null;
      if (isAccepted === false) {
        topLevelClasses.push(styles.declined);
        if (expanded) expandedNodeClass = styles.childDeclined;
      }
      let status = null;
      if ('action' in pathwayNode) {
        if (isOnPatientPath) status = isAccepted;
        else status = isGuidance && documentation ? true : null;
      } else if (!isCurrentNode && documentation) {
        status = true;
      }

      return (
        <div className={topLevelClasses.join(' ')} style={style} ref={ref}>
          <div
            className={`${nodeStyles.nodeTitle} ${onClickHandler && nodeStyles.clickable}`}
            onClick={onClickHandler}
          >
            <div className={nodeStyles.iconAndLabel}>
              <NodeIcon pathwayNode={pathwayNode} isGuidance={isGuidance} />
              {label}
            </div>
            <StatusIcon status={status} />
          </div>
          {expanded && (
            <div className={`${styles.expandedNode} ${expandedNodeClass}`}>
              <ExpandedNode
                pathwayNode={pathwayNode as GuidanceNode}
                isActionable={isActionable}
                isGuidance={isGuidance}
                documentation={documentation}
                isAccepted={isAccepted}
                isCurrentNode={isCurrentNode}
              />
            </div>
          )}
        </div>
      );
    }
  )
);

interface NodeIconProps {
  pathwayNode: PathwayNode;
  isGuidance: boolean;
}

const NodeIcon: FC<NodeIconProps> = ({ pathwayNode, isGuidance }) => {
  let icon: IconProp = faMicroscope;
  if (pathwayNode.label === 'Start') icon = faPlay;
  if (isGuidance) {
    const guidancePathwayNode = pathwayNode as GuidanceNode;
    if (guidancePathwayNode.action.length > 0) {
      const resourceType = guidancePathwayNode.action[0].resource.resourceType;
      if (resourceType === 'MedicationRequest') icon = faPrescriptionBottleAlt;
      else if (resourceType === 'ServiceRequest') icon = faSyringe;
      else if (resourceType === 'CarePlan') icon = faBookMedical;
    }
  }
  return <FontAwesomeIcon icon={icon} className={styles.icon} />;
};

interface StatusIconProps {
  status: boolean | null;
}

const StatusIcon: FC<StatusIconProps> = ({ status }) => {
  if (status === null) return null;
  const icon = status ? faCheckCircle : faTimesCircle;
  return <FontAwesomeIcon icon={icon} className={styles.statusIcon} />;
};

export default Node;
