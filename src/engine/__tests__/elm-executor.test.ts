import { executeElm } from '../elm-executor';
import fs from 'fs';
import path from 'path';

const elmFilePath = 'elm/Output.elm';
const getFixtureJson = filename =>
  JSON.parse(fs.readFileSync(path.join(__dirname, filename), 'utf-8'));

const elm = getFixtureJson(elmFilePath);

/**
 * Test patient1 is T0N2
 * To pass it must return the resources for the observation of T0 and N2
 * as well as the procedures teleradiotherapy, chemo, and chemo medication
 */
test('Patient1 T0N2 returns expected data', () => {
  const patientFilePath = 'patients/T0_patient.json';
  const patient = getFixtureJson(patientFilePath);

  const engineReturn = executeElm(patient, elm);
  // console.log(JSON.stringify(engineReturn, undefined, 2));

  const results = engineReturn.patientResults;
  // console.log(JSON.stringify(results, undefined, 2));

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

/**
 * Test patient2 is T1N0
 * To pass it must return the resources for the observation of T1 and N0
 * as well as the procedures lumpectomy
 */
test('Patient2 T1N0 returns expected data', () => {
  const patientFilePath = 'patients/T1_patient.json';

  const patient = getFixtureJson(patientFilePath);

  const engineReturn = executeElm(patient, elm);

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

/**
 * Test patient3 is T2N1
 * To pass it must return the resources for the observation of T1 and N0
 * as well as the procedures lumpectomy
 */
test('Patient3 T2N1 returns expected data', () => {
  const patientFilePath = 'patients/triple_negative.json';

  const patient = getFixtureJson(patientFilePath);

  const engineReturn = executeElm(patient, elm);

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
