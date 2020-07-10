import React from 'react';
import { render } from '@testing-library/react';
import ExpandedNode from 'components/ExpandedNode';
import {
  ActionNode,
  BasicActionResource,
  BasicMedicationRequestResource,
  DocumentationResource
} from 'pathways-model';

const fixedUpdatedDate = '2020-02-10T18:55:18.991+00:00';
const testDoc: DocumentationResource = {
  resourceType: 'Observation',
  id: '138629',
  status: 'final',
  node: 'N-test',
  resource: {
    resourceType: 'Observation',
    id: '138629',
    meta: {
      versionId: '1',
      lastUpdated: fixedUpdatedDate,
      profile: [
        'http://hl7.org/fhir/us/shr/StructureDefinition/onco-core-TNMClinicalRegionalNodesCategory'
      ]
    },
    extension: [
      {
        url:
          'http://hl7.org/fhir/us/shr/DSTU2/' +
          'StructureDefinition/onco-core-RelatedCancerCondition-extension',
        valueReference: { reference: 'Condition/1d4d5de8-097d-4c5b-bb7b-48b5fd7fb441' }
      }
    ]
  }
};
const testActionState: ActionNode = {
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
  transitions: [
    {
      transition: 'Test transition'
    }
  ]
};

const testMedicationRequestState: ActionNode = {
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

describe('<ExpandedNode />', () => {
  it('renders a ExpandedNode for action node', () => {
    const { getByText, queryByRole, queryByText } = render(
      <ExpandedNode
        actionNode={testActionState}
        isActionable={false}
        isAction={true}
        documentation={undefined}
        isAccepted={null}
        isCurrentNode={true}
      />
    );

    const resource = testActionState.action[0].resource as BasicActionResource;

    expect(getByText(testActionState.action[0].description)).toBeVisible();
    expect(getByText(resource.resourceType)).toBeVisible();
    expect(getByText(resource.code.coding[0].system)).toBeVisible();
    expect(getByText(resource.code.coding[0].code)).toBeVisible();
    expect(getByText(resource.code.coding[0].display)).toBeVisible();

    // Form and buttons should not be displayed in an inactive ExpandedNode
    expect(queryByRole('form')).toBeNull();
    expect(queryByText('Accept')).toBeNull();
    expect(queryByText('Decline')).toBeNull();
    expect(queryByText('Use Default Text')).toBeNull();
  });

  it('renders a ExpandedNode for a medication request state', () => {
    const { getByText } = render(
      <ExpandedNode
        actionNode={testMedicationRequestState}
        isActionable={false}
        isAction={true}
        documentation={undefined}
        isAccepted={null}
        isCurrentNode={true}
      />
    );

    const resource = testMedicationRequestState.action[0]
      .resource as BasicMedicationRequestResource;

    expect(getByText(testMedicationRequestState.action[0].description)).toBeVisible();
    expect(getByText(resource.resourceType)).toBeVisible();
    expect(getByText(resource.medicationCodeableConcept.coding[0].system)).toBeVisible();
    expect(getByText(resource.medicationCodeableConcept.coding[0].code)).toBeVisible();
    expect(getByText(resource.medicationCodeableConcept.coding[0].display)).toBeVisible();
  });

  it('renders an active ExpandedNode', () => {
    const { getByText, getByRole } = render(
      <ExpandedNode
        actionNode={testActionState}
        isActionable={true}
        isAction={true}
        documentation={testDoc}
        isAccepted={true}
        isCurrentNode={true}
      />
    );

    expect(getByText('Final')).toBeVisible();
    // TODO: brittle
    const dateString = new Date(fixedUpdatedDate).toLocaleString();
    expect(getByText(dateString)).toBeVisible();

    // Form and buttons should be displayed in an active ExpandedNode
    expect(getByRole('form')).toBeVisible();
    expect(getByText('Accept')).toBeVisible();
    expect(getByText('Decline')).toBeVisible();
    expect(getByText('Use Default Text')).toBeVisible();
  });

  it('renders advance button', () => {
    const { getByText } = render(
      <ExpandedNode
        actionNode={testActionState}
        isActionable={false}
        isAction={true}
        documentation={testDoc}
        isAccepted={null}
        isCurrentNode={true}
      />
    );

    // Advance button should be displayed on node that is non-actionable, action, and current
    expect(getByText('Advance')).toBeVisible();
  });
});
