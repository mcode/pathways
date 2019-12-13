import convertCQL, {convertBasicCQL} from '../cql-to-elm';
import { connect } from 'http2';

const fakeCQL = "library mCODEResources version '1'";
const fakeELM = {
  library: {
    identifier: {
      id: 'mCODEResources',
      version: '1'
    }
  }
};

const fakeCqlObject = {
    main: "library mCODEResources version '1'",
    libraries: {
        ex1: "library example version '2'"
    }
}

const fakeResponse = `--Boundary_1
Content-Type: application/elm+json
Content-Disposition: form-data; name="main"

{
   "library" : {
      "identifier" : {
         "id" : "mCODEResources",
         "version" : "1"
      },
      "schemaIdentifier" : {
         "id" : "urn:hl7-org:elm",
         "version" : "r1"
      }
   }
}
--Boundary_1
Content-Type: application/elm+json
Content-Disposition: form-data; name="ex1"

{
   "library" : {
      "identifier" : {
         "id" : "example",
         "version" : "2"
      },
      "schemaIdentifier" : {
         "id" : "urn:hl7-org:elm",
         "version" : "r1"
      }
   }
}
--Boundary_1--`

const fakeHeader = "multipart/form-data;boundary=Boundary_1";
describe('cql-to-elm', () => {
  it('converts basic cql to elm', done => {
    global.fetch = jest.fn(() => Promise.resolve({ json: () => fakeELM }));
    convertBasicCQL(fakeCQL).then(elm => {
      expect(elm).toHaveProperty('library');
      expect(elm).toHaveProperty('library.identifier');
      expect(elm).toHaveProperty('library.identifier.id', 'mCODEResources');
      expect(elm).toHaveProperty('library.identifier.version', '1');
      done();
    });
  });

  it('converts complex cql to elm', done=> {
    global.fetch = jest.fn(() => Promise.resolve({
        headers: {
            get: (s:string) => fakeHeader
        },
        text: () => Promise.resolve(fakeResponse)
    }));
    convertCQL(fakeCqlObject).then(elms => {
        expect(elms).toHaveProperty('main');
        expect(elms).toHaveProperty('main.library');
        expect(elms).toHaveProperty('main.library.identifier');
        expect(elms).toHaveProperty('main.library.identifier.id', 'mCODEResources');
        
        expect(elms).toHaveProperty('libraries');
        expect(elms).toHaveProperty('libraries.ex1');
        expect(elms).toHaveProperty('libraries.ex1.library');
        expect(elms).toHaveProperty('libraries.ex1.library.identifier');
        expect(elms).toHaveProperty('libraries.ex1.library.identifier.id', 'example');
        done();
    })
  })
});
