import React, { FC, ReactElement } from 'react';
import { Edge, Coordinate } from 'graph-model';
import styles from './Arrow.module.scss';

interface ArrowProps {
  edge: Edge;
  edgeName: string;
  isOnPatientPath: boolean;
  widthOffset: number;
}

const Arrow: FC<ArrowProps> = ({ edge, edgeName, isOnPatientPath, widthOffset }) => {
  const className = isOnPatientPath ? styles.arrowOnPatientPath : styles.arrow;
  const edgeNameNoWhitespace = edgeName.replace(' ', '');
  const arrowheadId = `arrowhead-${edgeNameNoWhitespace}`;

  // Returns path for arrow from edge points
  const createPath = (points: Coordinate[], arrowheadId: string): ReactElement => {
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

    pathString =
      length % 3 === 0
        ? writeCommandString(0)
        : length % 3 === 1
        ? writeCommandString(1)
        : writeCommandString(2);

    return <path d={pathString} fill="transparent" markerEnd={`url(#${arrowheadId})`} />;
  };

  const { label } = edge;
  return (
    <svg className={className}>
      {createPath(edge.points, arrowheadId)}
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

export default Arrow;
