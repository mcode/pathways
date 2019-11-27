import { graphLayout } from '../graph-layout';

import samplePathway from '../../__tests__/fixtures/pathways/sample_pathway.json';
import upennPathway from '../../__tests__/fixtures/pathways/upenn_her2_pathway.json';

describe('pathway graph layout', () => {
  // it('pathway layout set correctly', () => {
  //   const algoOutput = graphLayout(samplePathway);
  //   console.log(algoOutput);
  // });

  it('pathway layout set correctly', () => {
    const algoOutput = graphLayout(upennPathway);
    console.log(algoOutput);
  });
});
