import pathway from './fixtures/pathways/sample_pathway.json';
import { extractNavigationCQL, extractPreconditionCQL } from '../cql-extractor';

describe('extractNavigationCQL', () => {
  it('extracts the CQL from a pathway', () => {
    const extractedCQL = extractNavigationCQL(pathway);
    // TODO: cql extraction no longer requires a fetch,
    // the entire CQL of any needed libraries is included directly
    expect(extractedCQL).resolves.toHaveProperty('main', expect.stringContaining('fakeCQL'));
    // expect(extractedCQL).resolves.toEqual(expect.stringContaining('fakeCQL'));
    // expect(extractedCQL).resolves.not.toEqual(expect.stringContaining('flux-capacitor'));
    // expect(extractedCQL).resolves.toEqual(expect.stringContaining('Primary tumor'));
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
