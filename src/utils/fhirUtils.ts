import { BasicMedicationRequestResource, BasicActionResource, GuidanceState } from 'pathways-model';
import { Note, toString } from 'components/NoteProvider';
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
  data: string,
  labelOrCondition: string,
  patient: fhir.Patient
): fhir.DocumentReference {
  return {
    resourceType: 'DocumentReference',
    id: v1(),
    meta: {
      lastUpdated: getCurrentTime()
    },
    status: 'current',
    subject: { reference: `Patient/${patient.id}` },
    identifier: [
      {
        system: 'pathways.documentreference',
        value: btoa(labelOrCondition)
      }
    ],
    content: [
      {
        attachment: {
          data: btoa(data), // Base 64 encoded data
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

export function createNoteContent(
  note: Note,
  patientRecords: fhir.DomainResource[],
  status: string,
  notes: string,
  pathwayState?: GuidanceState
): string {
  note.status = status;
  note.notes = notes;
  if (pathwayState) {
    note.treatment = pathwayState.action[0].description;
    note.node = pathwayState.label;
  }

  const tnm: string[] = ['', '', ''];
  patientRecords.forEach(record => {
    // TODO: should use code bindings over
    // profile names.
    if (record.meta?.profile && record.meta.profile.length) {
      const elements = [
        'TNMClinicalPrimaryTumorCategory',
        'TNMClinicalRegionalNodesCategory',
        'TNMClinicalDistantMetastasesCategory'
      ];

      const profile = record.meta.profile[0];
      if (record.resourceType === 'Observation') {
        if (profile.includes('TumorMarkerTest') && record.resourceType === 'Observation') {
          const obs = record as fhir.Observation;
          const value = obs.valueCodeableConcept?.text;
          const name = obs.code.text;
          if (value && name) {
            note.mcodeElements[name] = value;
          }
        } else if (
          elements.some(value => {
            return profile.includes(value);
          })
        ) {
          const index = elements.findIndex(value => {
            return profile.includes(value);
          });
          if (index > -1) {
            const obs = record as fhir.Observation;
            const value = obs.valueCodeableConcept?.text;
            if (value) {
              tnm[index] = value;
            }
          }
        }
      }
    }
  });

  note.mcodeElements['Clinical TNM'] = tnm.join(' ');
  return toString(note);
}

function getCurrentTime(): string {
  const now = new Date();
  return (
    now.getFullYear() +
    '-' +
    withLeadingZero(now.getMonth()) +
    '-' +
    withLeadingZero(now.getDay()) +
    'T' +
    withLeadingZero(now.getUTCHours()) +
    ':' +
    withLeadingZero(now.getUTCMinutes()) +
    ':' +
    withLeadingZero(now.getUTCSeconds()) +
    '.' +
    now.getUTCMilliseconds() +
    '+00:00'
  );
}

function withLeadingZero(n: number): string {
  return n < 10 ? '0' + n : n.toString();
}
