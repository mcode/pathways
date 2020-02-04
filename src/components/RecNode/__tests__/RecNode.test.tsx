import React from 'react';
import { render } from '@testing-library/react';
import RecNode from 'components/RecNode';
import { GuidanceState, BasicActionResource, BasicMedicationRequestResource } from 'pathways-model';

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
  cql: 'Chemotherapy',
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
  cql: 'DoxorubicinRequest',
  transitions: []
};

describe('<RecNode />', () => {
  it('renders a RecNode for action state', () => {
    const { getByText, queryByRole, queryByText } = render(
      <RecNode pathwayState={testActionState} isActionable={false} isGuidance={true} />
    );

    const resource = testActionState.action[0].resource as BasicActionResource;

    expect(getByText(testActionState.action[0].description)).toBeVisible();
    expect(getByText(resource.resourceType)).toBeVisible();
    expect(getByText(resource.code.coding[0].system)).toBeVisible();
    expect(getByText(resource.code.coding[0].code)).toBeVisible();
    expect(getByText(resource.code.coding[0].display)).toBeVisible();

    // Form and buttons should not be displayed in an inactive RecNode
    expect(queryByRole('form')).toBeNull();
    expect(queryByText('Accept')).toBeNull();
    expect(queryByText('Decline')).toBeNull();
    expect(queryByText('Use Default Text')).toBeNull();
  });

  it('renders a RecNode for a medication request state', () => {
    const { getByText } = render(
      <RecNode pathwayState={testMedicationRequestState} isActionable={false} isGuidance={true} />
    );

    const resource = testMedicationRequestState.action[0]
      .resource as BasicMedicationRequestResource;

    expect(getByText(testMedicationRequestState.action[0].description)).toBeVisible();
    expect(getByText(resource.resourceType)).toBeVisible();
    expect(getByText(resource.medicationCodeableConcept.coding[0].system)).toBeVisible();
    expect(getByText(resource.medicationCodeableConcept.coding[0].code)).toBeVisible();
    expect(getByText(resource.medicationCodeableConcept.coding[0].display)).toBeVisible();
  });

  it('renders an active RecNode', () => {
    const { getByText, getByRole } = render(
      <RecNode pathwayState={testActionState} isActionable={true} />
    );

    // Form and buttons should be displayed in an active RecNode
    expect(getByRole('form')).toBeVisible();
    expect(getByText('Accept')).toBeVisible();
    expect(getByText('Decline')).toBeVisible();
    expect(getByText('Use Default Text')).toBeVisible();
  });
});
