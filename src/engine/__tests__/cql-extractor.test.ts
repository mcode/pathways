import pathway from './fixtures/pathways/sample_pathway.json';
import { extractNavigationCQL, extractCriteriaCQL } from '../cql-extractor';

describe('extractNavigationCQL', () => {
  it('extracts the CQL from a pathway', () => {
    global.fetch = jest.fn(() => Promise.resolve({ text: () => 'fakeCQL' }));
    const extractedCQL = extractNavigationCQL(pathway);
    expect(extractedCQL).resolves.toEqual(expect.stringContaining('fakeCQL'));
    expect(extractedCQL).resolves.not.toEqual(expect.stringContaining('flux-capacitor'));
    expect(extractedCQL).resolves.toEqual(expect.stringContaining('Primary tumor'));
  });
});

describe('extractCriteriaCQL', () => {
  it('extracts the criteria CQL from a pathway', () => {
    global.fetch = jest.fn(() => Promise.resolve({ text: () => 'fakeCQL' }));
    const extractedCQL = extractCriteriaCQL(pathway);
    expect(extractedCQL).resolves.toEqual(expect.stringContaining('fakeCQL'));
    expect(extractedCQL).resolves.not.toEqual(expect.stringContaining('flux-capacitor'));
    expect(extractedCQL).resolves.toEqual(
      expect.stringContaining('Malignant neoplasm of breast (disorder)')
    );
  });
});
