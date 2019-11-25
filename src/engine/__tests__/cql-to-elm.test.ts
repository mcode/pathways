import convertCQL from '../cql-to-elm';

const fakeCQL = "library mCODEResources version '1'";
const fakeELM = {
  library: {
    identifier: {
      id: 'mCODEResources',
      version: '1'
    }
  }
};

describe('cql-to-elm', () => {
  it('converts cql to elm', done => {
    global.fetch = jest.fn(() => Promise.resolve({ json: () => fakeELM }));
    convertCQL(fakeCQL).then(elm => {
      expect(elm).toHaveProperty('library');
      expect(elm).toHaveProperty('library.identifier');
      expect(elm).toHaveProperty('library.identifier.id', 'mCODEResources');
      expect(elm).toHaveProperty('library.identifier.version', '1');
      done();
    });
  });
});
