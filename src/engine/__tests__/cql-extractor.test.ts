import pathway from './fixtures/pathways/sample_pathway.json';
import extractCQL from '../cql-extractor';

describe('extractCQL', () => {
  it('extracts the CQL from a pathway', () => {
    global.fetch = jest.fn(() => Promise.resolve({ text: () => 'fakeCQL' }));
    const extractedCQL = extractCQL(pathway);
    expect(extractedCQL).resolves.toEqual(expect.stringContaining('fakeCQL'));
    expect(extractedCQL).resolves.not.toEqual(expect.stringContaining('flux-capacitor'));
    expect(extractedCQL).resolves.toEqual(expect.stringContaining('Primary tumor'));
  });
});
