import React, { FC } from 'react';
import { Edge } from 'graph-model';
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

  return (
    <svg className={className}>
      {edge.points.map((p, i, arr) => {
        // Do not map last point
        if (i === arr.length - 1) return null;

        const key = `${edgeNameNoWhitespace}-${i}`;
        const point2 = arr[i + 1];

        // Add arrowhead to last point
        return i !== arr.length - 2 ? (
          <line
            key={key}
            x1={p.x + widthOffset}
            y1={p.y}
            x2={point2.x + widthOffset}
            y2={point2.y}
          />
        ) : (
          <line
            key={key}
            x1={p.x + widthOffset}
            y1={p.y}
            x2={point2.x + widthOffset}
            y2={point2.y - 17.5}
            markerEnd={`url(#arrowhead-${edgeNameNoWhitespace})`}
          />
        );
      })}
      <defs>
        <marker
          id={`arrowhead-${edgeNameNoWhitespace}`}
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
