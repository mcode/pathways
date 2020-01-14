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

  const createPath = (points: Coordinate[], arrowheadId: string): ReactElement => {
    const pointsWithOffset = points.map((p, i, arr) => {
      const x = p.x + widthOffset;
      const y = i === arr.length - 1 ? p.y - 17.5 : p.y;

      return { x, y };
    });

    const length = pointsWithOffset.length;
    let pathString = `M ${pointsWithOffset[0].x} ${pointsWithOffset[0].y} `;

    if (length === 3) {
      pathString = `${pathString} C ${pointsWithOffset.map(p => `${p.x} ${p.y}`).join(',')}`;
    } else {
      pathString = `${pathString} C ${pointsWithOffset[1].x} ${pointsWithOffset[1].y}, 
      ${pointsWithOffset[length - 2].x} ${pointsWithOffset[length - 2].y},
      ${pointsWithOffset[length - 1].x} ${pointsWithOffset[length - 1].y}`;
    }

    return <path d={pathString} fill="transparent" markerEnd={`url(#${arrowheadId})`} />;
  };

  return (
    <svg className={className}>
      {createPath(edge.points, arrowheadId)}
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
