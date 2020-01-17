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
    const pointsWithOffset = points.map((p, i, arr) => {
      const x = p.x + widthOffset;

      // Adjust y coordinate of last point for arrowhead
      const y = i === arr.length - 1 ? p.y - 17.5 : p.y;

      return { x, y };
    });

    const length = pointsWithOffset.length;
    let pathString = `M ${pointsWithOffset[0].x} ${pointsWithOffset[0].y} `;

    /**
     * The points to use in the Cubic command is determined by the length of points array
     * If i % 3 is 0, use all points including the 1st point
     * If i % 3 is 1, use all points except the 1st point
     * If i % 3 is 2, use all points including the 1st point and reuse every 3rd point
     * We need points to be a multiple of 3 because the Cubic command expects 3 points
     */
    if (length % 3 === 0) {
      pathString = pointsWithOffset.reduce((acc, point, i, arr) => {
        if (i % 3 !== 0) return acc;
        return `${acc} C ${point.x} ${point.y} ${arr[i + 1].x} ${arr[i + 1].y} ${arr[i + 2].x} 
        ${arr[i + 2].y}`;
      }, pathString);
    } else if (length % 3 === 1) {
      pathString = pointsWithOffset.reduce((acc, point, i, arr) => {
        if (i % 3 !== 1) return acc;
        return `${acc} C ${point.x} ${point.y} ${arr[i + 1].x} ${arr[i + 1].y} ${arr[i + 2].x} 
        ${arr[i + 2].y}`;
      }, pathString);
    } else {
      pathString = pointsWithOffset.reduce((acc, point, i, arr) => {
        if (i !== 0 && i % 3 !== 2) return acc;
        return `${acc} C ${point.x} ${point.y} ${arr[i + 1].x} ${arr[i + 1].y} ${arr[i + 2].x} 
        ${arr[i + 2].y}`;
      }, pathString);
    }

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
