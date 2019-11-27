import { Graph } from '../graph';

import samplePathway from '../../__tests__/fixtures/pathways/sample_pathway.json';
import upennPathway from '../../__tests__/fixtures/pathways/upenn_her2_pathway.json';

describe('pathway graph layout', () => {
  it('pathway layout set correctly', () => {
    let graph = new Graph(samplePathway);
    let graphCoordinates = graph.layout();
    console.log(graphCoordinates);
  });

  it('pathway layout set correctly', () => {
    let graph = new Graph(upennPathway);
    let graphCoordinates = graph.layout();
    console.log(graphCoordinates);
  });
});
