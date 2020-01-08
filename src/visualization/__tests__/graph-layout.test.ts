import layout from '../layout';

import samplePathway from './fixtures/pathways/sample_pathway.json';
import upennPathway from './fixtures/pathways/upenn_her2_pathway.json';
import testPathway from './fixtures/pathways/graph_layout_test_pathway.json';
import { Coordinates } from 'graph-model';

describe('pathway graph layout', () => {
  it('sample pathway layout set correctly', () => {
    const graphCoordinates = layout(samplePathway);
    checkLayout(graphCoordinates);
  });

  it('test pathway layout set correctly', () => {
    const graphCoordinates = layout(testPathway);
    checkLayout(graphCoordinates);
  });

  it('upenn pathway layout set correctly', () => {
    const graphCoordinates = layout(upennPathway);
    checkLayout(graphCoordinates);
  });

  // Helper function to validate layout output
  function checkLayout(graphCoordinates: Coordinates): void {
    // Verify every node has (x,y) and only start has y: 0
    for (const nodeName in graphCoordinates) {
      // Validate node
      const coords = graphCoordinates[nodeName];
      expect(coords).toBeDefined();
      expect(coords.x).toBeDefined();
      expect(coords.y).toBeDefined();
      if (nodeName !== 'Start') expect(coords.y !== 0).toBeTruthy();

      // Validate node does not overlap with another node
      for (const otherNodeName in graphCoordinates) {
        if (nodeName !== otherNodeName) {
          const otherCoords = graphCoordinates[otherNodeName];
          expect(coords.x === otherCoords.x && coords.y === otherCoords.y).toBeFalsy();
        }
      }
    }
  }
});
