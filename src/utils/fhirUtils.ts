import { BasicMedicationRequestResource, BasicActionResource } from 'pathways-model';
import { v1 } from 'uuid';

// translates pathway recommendation resource into suitable FHIR resource
export function translatePathwayRecommendation(
  pathwayResource: BasicMedicationRequestResource | BasicActionResource,
  patientId: string
): fhir.Resource {
  const { resourceType } = pathwayResource;
  const resourceProperties = {
    resourceType,
    id: v1(),
    intent: 'order',
    subject: { reference: `Patient/${patientId}` },
    status: 'active',
    authoredOn: new Date().toISOString(),
    meta: {
      lastUpdated: new Date().toISOString()
    }
  };

  switch (resourceType) {
    case 'ServiceRequest': {
      const { code } = pathwayResource as BasicActionResource;
      return {
        ...resourceProperties,
        code
      };
    }
    case 'MedicationRequest': {
      const { medicationCodeableConcept } = pathwayResource as BasicMedicationRequestResource;
      return {
        ...resourceProperties,
        medicationCodeableConcept
      };
    }
    default: {
      throw Error(`Translation for ${resourceType} not implemented.`);
    }
  }
}

export function getHumanName(person: fhir.HumanName | fhir.HumanName[]): string {
  let name = '';
  if (Array.isArray(person)) {
    name = [
      person[0]?.prefix?.join(' '),
      person[0]?.given?.join(' '),
      person[0]?.family,
      person[0]?.suffix?.join(' ')
    ].join(' ');
  } else {
    name = [
      person?.prefix?.join(' '),
      person?.given?.join(' '),
      person?.family,
      person?.suffix?.join(' ')
    ].join(' ');
  }
  return name;
}

export function createDocumentReference(
  selected: string,
  patient: fhir.Patient
): fhir.DocumentReference {
  return {
    resourceType: 'DocumentReference',
    status: 'current',
    subject: { reference: `Patient/${patient.id}` },
    content: [
      {
        attachment: {
          data: btoa(selected), // Base 64 encoded data
          contentType: 'text/plain'
        }
      }
    ],
    // type and indexed are required in STU3 DocumentReference but not in R4
    type: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '34108-1',
          display: 'Outpatient Note'
        }
      ]
    },
    indexed: ''
  };
}
