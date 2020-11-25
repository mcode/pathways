import pathway from './fixtures/pathways/sample_pathway.json';
import { extractNavigationCQL, extractPreconditionCQL } from '../cql-extractor';

describe('extractNavigationCQL', () => {
  it('extracts the CQL from a pathway', () => {
    const extractedCQL = extractNavigationCQL(pathway);
    expect(extractedCQL).resolves.toHaveProperty('main', expect.stringContaining("library main_library version '1.0'"));
    expect(extractedCQL).resolves.toHaveProperty('libraries.dependency', expect.stringContaining("library dependency version '1.2.3'"));
    expect(extractedCQL).resolves.toHaveProperty('libraries.another_dep', expect.stringContaining("library another_dep version '2.0'"));
  });
});

describe('extractPreconditionCQL', () => {
  it('extracts the precondition CQL from a pathway', () => {
    const extractedCQL = extractPreconditionCQL(pathway);
    expect(extractedCQL).resolves.toEqual(expect.stringContaining('fakeCQL'));
    expect(extractedCQL).resolves.not.toEqual(expect.stringContaining('flux-capacitor'));
    expect(extractedCQL).resolves.toEqual(
      expect.stringContaining('Malignant neoplasm of breast (disorder)')
    );
  });
});
