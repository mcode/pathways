import React, { FC } from 'react';
import { Edge, Coordinate } from 'graph-model';
import styles from './Arrow.module.scss';

interface ArrowProps {
  edge: Edge;
  edgeName: string;
  isOnPatientPath: boolean;
  widthOffset: number;
  isCurrentBranch: boolean | null;
}

interface ArrowPathProps {
  points: Coordinate[];
  arrowheadId: string;
  widthOffset: number;
}

const Arrow: FC<ArrowProps> = ({
  edge,
  edgeName,
  isOnPatientPath,
  widthOffset,
  isCurrentBranch
}) => {
  const className = isOnPatientPath
    ? styles.arrowOnPatientPath
    : isCurrentBranch
    ? styles.branchArrow
    : styles.arrow;
  const edgeNameNoWhitespace = edgeName.replace(' ', '');
  const arrowheadId = `arrowhead-${edgeNameNoWhitespace}`;

  const { label } = edge;
  return (
    <svg className={className}>
      <ArrowPath points={edge.points} arrowheadId={arrowheadId} widthOffset={widthOffset} />
      {label ? (
        <text x={label.x + widthOffset} y={label.y}>
          {label.text}
        </text>
      ) : null}
      <defs>
        <marker
          id={arrowheadId}
          className={styles.arrowhead}
          markerWidth="10"
          markerHeight="7"
          refX="0"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
    </svg>
  );
};

// Returns path for arrow from edge points
const ArrowPath: FC<ArrowPathProps> = ({ points, arrowheadId, widthOffset }) => {
  const pointsWithOffset = points.map(p => ({ x: p.x + widthOffset, y: p.y }));
  const length = pointsWithOffset.length;
  pointsWithOffset[length - 1].y -= 17.5;
  let pathString = `M ${pointsWithOffset[0].x} ${pointsWithOffset[0].y} `;

  /**
   * The points to use in the Cubic command is determined by the length of points array
   * If i % 3 is 0, use all points including the 1st point
   * If i % 3 is 1, use all points except the 1st point
   * If i % 3 is 2, use all points including the 1st point and reuse every 3rd point
   * We need points to be a multiple of 3 because the Cubic command expects 3 points
   */
  const writeCommandString = (remainder: number): string => {
    return pointsWithOffset.reduce((acc, point, i, arr) => {
      return i % 3 !== remainder
        ? acc
        : `${acc} C ${point.x} ${point.y} ${arr[i + 1].x} ${arr[i + 1].y} ${arr[i + 2].x}
        ${arr[i + 2].y}`;
    }, pathString);
  };

  pathString = writeCommandString(length % 3);

  return <path d={pathString} fill="transparent" markerEnd={`url(#${arrowheadId})`} />;
};

export default Arrow;
