import React, { FC } from 'react';

import { Pathway } from 'pathways-model';
import GraphAlg from '../engine/graph';
import Node from './Node';

interface GraphProps {
  pathway: Pathway | null;
}

const Graph: FC<GraphProps> = ({ pathway }) => {
  const getGraphLayout = (pathway: Pathway | null) => {
    if (pathway === null) return;
    const graph = new GraphAlg(pathway);
    return graph.layout();
  };

  const layout = getGraphLayout(pathway);
  const maxHeight: number =
    layout !== undefined
      ? Object.values(layout)
          .map(x => x.y)
          .reduce((a, b) => Math.max(a, b))
      : 0;
  console.log(layout);
  return (
    <div style={{ height: maxHeight + 150 + 'px', position: 'relative' }}>
      {layout !== undefined
        ? Object.keys(layout).map(key => {
            return (
              <Node
                icon=""
                text={pathway!.states[key].label}
                xCoordinate={layout[key].x + window.innerWidth / 2}
                yCoordinate={layout[key].y}
              />
            );
          })
        : []}
    </div>
  );
};

export default Graph;
