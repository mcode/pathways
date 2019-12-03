import executeElm from '../elm-executor';

import elm from './fixtures/elm/convertedCQL.elm.json';

import t0Patient from './fixtures/patients/T0_patient.json';
import t1Patient from './fixtures/patients/T1_patient.json';
import tripleNegativePatient from './fixtures/patients/triple_negative.json';

const compareResults = (result, expectedResult) => {
  // expectedResult is of form:
  // { 'T = T1': 0,
  //   'N = N0': 0,
  //   ...
  // }

  for (const fieldName in expectedResult) {
    const expectedLength = expectedResult[fieldName];
    expect(result[fieldName]).toHaveLength(expectedLength);
  }
};

describe('ELM executor', () => {
  it('returns expected data for patient1 T0N2', () => {
    const engineReturn = executeElm(t0Patient, elm);
    const results = engineReturn.patientResults;

    const patientID = t0Patient.entry[0].resource.id;

    // Check resource sizes match up
    expect(Object.keys(results)).toHaveLength(1);
    const result = results[patientID];
    const expectedResult = {
      'T = T0': 1,
      'T = T1': 0,
      'N = N0': 0,
      'N = N1': 0,
      'Surgery': 0,
      'Radiation': 1,
      'Chemo': 8,
      'ChemoMedication': 8
    };

    compareResults(result, expectedResult);
  });

  it('returns expected data for Patient2 T1N0', () => {
    const engineReturn = executeElm(t1Patient, elm);
    const results = engineReturn.patientResults;

    const patientID = t1Patient.entry[0].resource.id;

    // Check resource sizes match up
    expect(Object.keys(results)).toHaveLength(1);
    const result = results[patientID];
    const expectedResult = {
      'T = T0': 0,
      'T = T1': 1,
      'N = N0': 1,
      'N = N1': 0,
      'Surgery': 1,
      'Radiation': 0,
      'Chemo': 0,
      'ChemoMedication': 0
    };

    compareResults(result, expectedResult);
  });

  it('returns expected data for Patient3 T2N1', () => {
    const engineReturn = executeElm(tripleNegativePatient, elm);
    const results = engineReturn.patientResults;

    const patientID = tripleNegativePatient.entry[0].resource.id;

    // Check resource sizes match up
    expect(Object.keys(results)).toHaveLength(1);
    const result = results[patientID];
    const expectedResult = {
      'T = T0': 0,
      'T = T1': 0,
      'N = N0': 0,
      'N = N1': 1,
      'Surgery': 1,
      'Radiation': 34,
      'Chemo': 16,
      'ChemoMedication': 0
    };

    compareResults(result, expectedResult);
  });
});
