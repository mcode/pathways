import React, { FC } from 'react';
import { Edge } from 'graph-model';

interface ArrowProps {
  edge: Edge;
  widthOffset: number;
}

const Arrow: FC<ArrowProps> = ({ edge, widthOffset }) => {
  return (
    <svg>
      {edge.points.map((p, i, arr) => {
        if (i === arr.length - 1) return null;
        const point2 = arr[i + 1];
        return i !== arr.length - 2 ? (
          <line
            x1={p.x + widthOffset}
            y1={p.y}
            x2={point2.x + widthOffset}
            y2={point2.y}
            stroke="black"
            strokeWidth="1"
          />
        ) : (
          <line
            x1={p.x + widthOffset}
            y1={p.y}
            x2={point2.x + widthOffset}
            y2={point2.y}
            stroke="black"
            strokeWidth="1"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
    </svg>
  );
}

export default Arrow;
