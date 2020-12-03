import pathway from './fixtures/pathways/sample_pathway.json';
import { extractCQL } from '../cql-extractor';

describe('extractCQL', () => {
  it('extracts the CQL from a pathway', () => {
    const extractedCQL = extractCQL(pathway);
    expect(extractedCQL).resolves.toHaveProperty(
      'main',
      expect.stringContaining("library main_library version '1.0'")
    );
    expect(extractedCQL).resolves.toHaveProperty(
      'libraries.dependency',
      expect.stringContaining("library dependency version '1.2.3'")
    );
    expect(extractedCQL).resolves.toHaveProperty(
      'libraries.another_dep',
      expect.stringContaining("library another_dep version '2.0'")
    );
  });
});
