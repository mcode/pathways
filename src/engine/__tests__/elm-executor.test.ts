import { executeElm } from '../elm-executor';

import elm from '../../__tests__/fixtures/elm/convertedCQL.elm.json';

import t0Patient from '../../__tests__/fixtures/patients/T0_patient.json';
import t1Patient from '../../__tests__/fixtures/patients/T1_patient.json';
import tripleNegativePatient from '../../__tests__/fixtures/patients/triple_negative.json';

describe('ELM executor', () => {

  it('returns expected data for patient1 T0N2', () => {
    const engineReturn = executeElm(t0Patient, elm);
    const results = engineReturn.patientResults;

    // Check resource sizes match up
    expect(Object.keys(results)).toHaveLength(1);
    const result = results[Object.keys(results)[0]];
    expect(result['T = T0'].length).toEqual(1);
    expect(result['T = T1'].length).toEqual(0);
    expect(result['N = N0'].length).toEqual(0);
    expect(result['N = N1'].length).toEqual(0);
    expect(result['Surgery'].length).toEqual(0);
    expect(result['Radiation'].length).toEqual(1);
    expect(result['Chemo'].length).toEqual(8);
    expect(result['ChemoMedication'].length).toEqual(8);
  });

  it('returns expected data for Patient2 T1N0', () => {
    const engineReturn = executeElm(t1Patient, elm);
    const results = engineReturn.patientResults;

    // Check resource sizes match up
    expect(Object.keys(results)).toHaveLength(1);
    const result = results[Object.keys(results)[0]];
    expect(result['T = T0'].length).toEqual(0);
    expect(result['T = T1'].length).toEqual(1);
    expect(result['N = N0'].length).toEqual(1);
    expect(result['N = N1'].length).toEqual(0);
    expect(result['Surgery'].length).toEqual(1);
    expect(result['Radiation'].length).toEqual(0);
    expect(result['Chemo'].length).toEqual(0);
    expect(result['ChemoMedication'].length).toEqual(0);
  });

  it('returns expected data for Patient3 T2N1', () => {
    const engineReturn = executeElm(tripleNegativePatient, elm);
    const results = engineReturn.patientResults;

    // Check resource sizes match up
    expect(Object.keys(results)).toHaveLength(1);
    const result = results[Object.keys(results)[0]];
    expect(result['T = T0'].length).toEqual(0);
    expect(result['T = T1'].length).toEqual(0);
    expect(result['N = N0'].length).toEqual(0);
    expect(result['N = N1'].length).toEqual(1);
    expect(result['Surgery'].length).toEqual(1);
    expect(result['Radiation'].length).toEqual(34);
    expect(result['Chemo'].length).toEqual(16);
    expect(result['ChemoMedication'].length).toEqual(0);
  });

});
