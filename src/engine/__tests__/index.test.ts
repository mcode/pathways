import { evaluatePatientOnPathway } from '..';

import pathway from '../../__tests__/fixtures/pathways/sample_pathway.json';
import preconvertedELM from '../../__tests__/fixtures/elm/sample_pathway.elm.json';

import patient1 from '../../__tests__/fixtures/patients/sample_pathway/patient1.json';
import patient2 from '../../__tests__/fixtures/patients/sample_pathway/patient2.json';
import patient3 from '../../__tests__/fixtures/patients/sample_pathway/patient3.json';
import patient4 from '../../__tests__/fixtures/patients/sample_pathway/patient4.json';

import expectedResults1 from '../../__tests__/fixtures/evaluationResults/sample_pathway/patient1.json';
import expectedResults2 from '../../__tests__/fixtures/evaluationResults/sample_pathway/patient2.json';
import expectedResults3 from '../../__tests__/fixtures/evaluationResults/sample_pathway/patient3.json';
import expectedResults4 from '../../__tests__/fixtures/evaluationResults/sample_pathway/patient4.json';

describe('pathways evaluation engine', () => {

  // mock out the actual webservice and preconvert the pathway CQL to ELM.
  global.fetch = jest.fn(() => Promise.resolve({ json: () => preconvertedELM, text: () => '' }));

  /**
   * Patient 1 is T1N0 and has completed lumpectomy and radiation
   */
  it('outputs correct data for patient1', done => {
    evaluatePatientOnPathway(patient1, pathway)
      .then(patientPath => {
        expect(patientPath).toEqual(expectedResults1);
        done();
      });
  });

  /**
   * Patient 2 is T0N1 and has completed medication request and chemo
   */
  it('outputs correct data for patient2', done => {
    evaluatePatientOnPathway(patient2, pathway)
      .then(patientPath => {
        expect(patientPath).toEqual(expectedResults2);
        done();
      });
  });

  /**
   * Patient 3 is T0 with no other data
   */
  it('outputs correct data for patient3', done => {
    evaluatePatientOnPathway(patient3, pathway)
      .then(patientPath => {
        expect(patientPath).toEqual(expectedResults3);
        done();
      });
  });

  /**
   * Patient 4 is T0N1 and is not done with ChemoMedication
   */
  it('outputs correct data for patient4', done => {
    evaluatePatientOnPathway(patient4, pathway)
      .then(patientPath => {
        expect(patientPath).toEqual(expectedResults4);
        done();
      });
  });
});