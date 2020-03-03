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
      return {};
    }
  }
}
