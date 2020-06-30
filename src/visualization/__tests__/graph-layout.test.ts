import layout from '../layout';

import samplePathway from './fixtures/pathways/sample_pathway.json';
import her2Pathway from './fixtures/pathways/her2_pathway.json';
import testPathway from './fixtures/pathways/graph_layout_test_pathway.json';
import { NodeCoordinates } from 'graph-model';

describe('pathway graph layout', () => {
  it('sample pathway layout set correctly', () => {
    const { nodeCoordinates } = layout(samplePathway, {});
    checkLayout(nodeCoordinates);
  });

  it('test pathway layout set correctly', () => {
    const { nodeCoordinates } = layout(testPathway, {});
    checkLayout(nodeCoordinates);
  });

  it('her2 pathway layout set correctly', () => {
    const { nodeCoordinates } = layout(her2Pathway, {});
    checkLayout(nodeCoordinates);
  });

  // Helper function to validate layout output
  function checkLayout(graphCoordinates: NodeCoordinates): void {
    // Verify every node has (x,y) and only start has y: 0
    for (const nodeKey in graphCoordinates) {
      // Validate node
      const coords = graphCoordinates[nodeKey];
      expect(coords).toBeDefined();
      expect(coords.x).toBeDefined();
      expect(coords.y).toBeDefined();
      if (nodeKey !== 'Start') expect(coords.y !== 0).toBeTruthy();

      // Validate node does not overlap with another node
      for (const otherNodeKey in graphCoordinates) {
        if (nodeKey !== otherNodeKey) {
          const otherCoords = graphCoordinates[otherNodeKey];
          expect(coords.x === otherCoords.x && coords.y === otherCoords.y).toBeFalsy();
        }
      }
    }
  }
});
