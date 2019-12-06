import React, { FC, useState } from 'react';

import GraphAlg from '../engine/graph';
import Node from './Node';
import icon from '../media-play-16.png';
import evaluatePatientOnPathway from 'engine';
import { usePathwayContext } from './PathwayProvider';

interface GraphProps {
  resources: any;
}

const Graph: FC<GraphProps> = ({ resources }) => {
  const pathway = usePathwayContext();
  const [path, setPath] = useState<string[]>([]);

  // Get the layout of the graph
  const getGraphLayout = () => {
    const graph = new GraphAlg(pathway);
    return graph.layout();
  };

  // Create a fake Bundle for the CQL engine
  const patient = { resourceType: 'Bundle', entry: resources.map((r: any) => ({ resource: r })) };
  if (path.length === 0 && patient.entry.length > 0)
    evaluatePatientOnPathway(patient, pathway).then(pathwayResults => setPath(pathwayResults.path));

  const layout = getGraphLayout();
  const maxHeight: number =
    layout !== undefined
      ? Object.values(layout)
          .map(x => x.y)
          .reduce((a, b) => Math.max(a, b))
      : 0;

  return (
    <div style={{ height: maxHeight + 150 + 'px', position: 'relative' }}>
      {layout !== undefined
        ? Object.keys(layout).map(key => {
            return (
              <Node
                key={key}
                icon={icon}
                text={pathway.states[key].label}
                isOnPatientPath={path.includes(key)}
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
