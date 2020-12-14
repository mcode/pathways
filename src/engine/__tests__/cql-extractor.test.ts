import pathway from './fixtures/pathways/sample_pathway.json';
import { extractCQL } from '../cql-extractor';

describe('extractCQL', () => {
  it('extracts the CQL from a pathway', () => {
    const extractedCQL = extractCQL(pathway);
    expect(extractedCQL).resolves.toHaveProperty(
      'main',
      expect.stringContaining("library LIB947dcdc version '1.0'")
    );
    expect(extractedCQL).resolves.toHaveProperty(
      'libraries.LIB_Preconditions',
      expect.stringContaining("library LIB_Preconditions version '1.0.0'")
    );
    expect(extractedCQL).resolves.toHaveProperty(
      'libraries.FHIRHelpers',
      expect.stringContaining("library FHIRHelpers version '4.0.1'")
    );
  });
});
