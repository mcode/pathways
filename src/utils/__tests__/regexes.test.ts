import {
  extractMultipartBoundary,
  extractMultipartFileName,
  extractJSONContent,
  extractCQLInclude
} from 'utils/regexes';

// sample response from https://github.com/cqframework/cql-translation-service
const sampleMultiPartHttpResponse = {
  headers: {
    status: 200,
    'MIME-Version': '1.0',
    'Content-Type': 'multipart/form-data;boundary=Boundary_2_526521536_1556163069788',
    Date: 'Thu, 25 Apr 2019 03:47:49 GMT',
    'Content-Length': '2365'
  },
  body: `
    Content-Type: application/elm+json
    Content-Disposition: form-data; name="HelloWorld"

    {
      "library" : {
          "identifier" : {
            "id" : "HelloWorld",
            "version" : "1.0.0"
          },
          "schemaIdentifier" : {
            "id" : "urn:hl7-org:elm",
            "version" : "r1"
          }
      }
    }
    --Boundary_2_526521536_1556163069788
    Content-Type: application/elm+json
    Content-Disposition: form-data; name="Speaker"

    {
      "library" : {
          "identifier" : {
            "id" : "Speaker",
            "version" : "1.0.0"
          },
          "schemaIdentifier" : {
            "id" : "urn:hl7-org:elm",
            "version" : "r1"
          }
      }
    }`
};

const sampleFirstPart = `
    Content-Type: application/elm+json
    Content-Disposition: form-data; name="HelloWorld"

    {
      "library" : {
          "identifier" : {
            "id" : "HelloWorld",
            "version" : "1.0.0"
          },
          "schemaIdentifier" : {
            "id" : "urn:hl7-org:elm",
            "version" : "r1"
          }
      }
    }`;

describe('extractMultipartBoundary', () => {
  it('correctly matches expected text', () => {
    const contentType = sampleMultiPartHttpResponse.headers['Content-Type'];
    const result = extractMultipartBoundary.exec(contentType);
    expect(result).not.toBeNull();
    if (result) {
      // typescript doesn't understand expect not null
      expect(result[1]).toEqual('Boundary_2_526521536_1556163069788');
    }
  });
});

describe('extractMultipartFileName', () => {
  it('correctly matches expected text', () => {
    const boundary = '--Boundary_2_526521536_1556163069788';
    const segments = sampleMultiPartHttpResponse.body.split(boundary);
    const expectedFileName = ['HelloWorld', 'Speaker'];
    segments.forEach((segment, index) => {
      const result = extractMultipartFileName.exec(segment);
      expect(result).not.toBeNull();
      if (result) {
        // typescript doesn't understand expect not null
        expect(result[1]).toEqual(expectedFileName[index]);
      }
    });
  });
});

describe('extractJSONContent', () => {
  it('correctly matches expected text', () => {
    const result = extractJSONContent.exec(sampleFirstPart);
    expect(result).not.toBeNull();
    if (result) {
      // typescript doesn't understand expect not null
      expect(result[1].startsWith('{')).toBeTruthy();
      expect(result[1].endsWith('}')).toBeTruthy();
      const parsed = JSON.parse(result[1]);
      expect(parsed).toEqual({
        library: {
          identifier: {
            id: 'HelloWorld',
            version: '1.0.0'
          },
          schemaIdentifier: {
            id: 'urn:hl7-org:elm',
            version: 'r1'
          }
        }
      });
    }
  });
});

/*
github.com/cqframework/cql-exec-examples/blob/master/diabetic-foot-exam/r4/cql/DiabeticFootExam.cql
*/
const sampleCQL = `
library DiabeticFootExam version '1.0.0'
using FHIR version '4.0.0'
include FHIRHelpers version '4.0.0' called FHIRHelpers

codesystem "SNOMEDCT": 'http://snomed.info/sct'
`;

describe('extractCQLInclude', () => {
  it('correctly matches expected text', () => {
    const result = extractCQLInclude.exec(sampleCQL);
    expect(result).not.toBeNull();
    if (result) {
      // typescript doesn't understand expect not null
      expect(result[1]).toEqual('FHIRHelpers');
    }
  });
});
