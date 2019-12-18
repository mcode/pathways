import React from 'react';
import { render } from '@testing-library/react';
import RecNode from 'components/RecNode';
import { GuidanceState, BasicActionResource, BasicMedictionRequestResource } from 'pathways-model';

const testActionState: GuidanceState = {
  label: 'Chemotherapy',
  action: [
    {
      type: 'create',
      description: 'Begin Chemotherapy procedure',
      resource: {
        resourceType: 'Procedure',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '367336001',
              display: 'Chemotherapy (procedure)'
            }
          ],
          text: 'Chemotherapy (procedure)'
        }
      }
    }
  ],
  cql:
    '[Procedure: "Chemotherapy (procedure) code"] Chemo return Tuple{ resourceType: \'Procedure\', id: Chemo.id.value, status: Chemo.status.value }',
  transitions: []
};

const testMedicationRequestState: GuidanceState = {
  label: 'ChemoMedication Request',
  action: [
    {
      type: 'create',
      description: 'Request 10ML Doxorubicin Hydrochloride 2MG/ML Injection',
      resource: {
        resourceType: 'MedicationRequest',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '1790099',
              display: '10 ML Doxorubicin Hydrochloride 2 MG/ML Injection'
            }
          ],
          text: '10 ML Doxorubicin Hydrochloride 2 MG/ML Injection'
        }
      }
    }
  ],
  cql:
    '[MedicationRequest: "10 ML Doxorubicin Hydrochloride 2 MG/ML Injection code"] ChemoMedication where ToConcept(ChemoMedication.medication as FHIR.CodeableConcept) ~ "10 ML Doxorubicin Hydrochloride 2 MG/ML Injection"return Tuple{ resourceType: \'MedicationRequest\', id: ChemoMedication.id.value, status: ChemoMedication.status.value }',
  transitions: []
};

describe('<RecNode />', () => {
  it('renders a RecNode for action state', () => {
    const { getByText } = render(<RecNode pathwayState={testActionState} />);

    const resource = testActionState.action[0].resource as BasicActionResource;

    expect(getByText(testActionState.action[0].description)).toBeVisible();
    expect(getByText(resource.resourceType)).toBeVisible();
    expect(getByText(resource.code.coding[0].system)).toBeVisible();
    expect(getByText(resource.code.coding[0].code)).toBeVisible();
    expect(getByText(resource.code.coding[0].display)).toBeVisible();
  });

  it('renders a RecNode for a medication request state', () => {
    const { getByText } = render(<RecNode pathwayState={testMedicationRequestState} />);

    const resource = testMedicationRequestState.action[0].resource as BasicMedictionRequestResource;

    expect(getByText(testMedicationRequestState.action[0].description)).toBeVisible();
    expect(getByText(resource.resourceType)).toBeVisible();
    expect(getByText(resource.medicationCodeableConcept.coding[0].system)).toBeVisible();
    expect(getByText(resource.medicationCodeableConcept.coding[0].code)).toBeVisible();
    expect(getByText(resource.medicationCodeableConcept.coding[0].display)).toBeVisible();
  });
});
