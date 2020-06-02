import { GuidanceState, EvaluatedPathway, Pathway } from 'pathways-model';
import { Note, toString } from 'components/NoteDataProvider';
import {
  Patient,
  DomainResource,
  HumanName,
  DocumentReference,
  Observation,
  ServiceRequest,
  MedicationRequest,
  CarePlan
} from 'fhir-objects';
import { R4 } from '@ahryman40k/ts-fhir-types';
import { v1 } from 'uuid';
import { McodeElements } from 'mcode';
import { PathwaysClient } from 'pathways-client';

// translates pathway recommendation resource into suitable FHIR resource
export function translatePathwayRecommendation(
  pathwayResource: MedicationRequest | ServiceRequest | CarePlan,
  patientId: string
): MedicationRequest | ServiceRequest | CarePlan {
  const { resourceType } = pathwayResource;
  const resourceProperties = {
    id: v1(),
    resourceType,
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
      const { code } = pathwayResource as ServiceRequest;
      return {
        ...resourceProperties,
        code
      } as ServiceRequest;
    }
    case 'MedicationRequest': {
      const { medicationCodeableConcept } = pathwayResource as MedicationRequest;
      return {
        ...resourceProperties,
        medicationCodeableConcept
      } as MedicationRequest;
    }
    case 'CarePlan': {
      const { title } = pathwayResource as CarePlan;
      return {
        ...resourceProperties,
        title
      } as CarePlan;
    }
    default: {
      throw Error(`Translation for ${resourceType} not implemented.`);
    }
  }
}

export function getHumanName(person: HumanName[]): string {
  let name = '';
  if (Array.isArray(person)) {
    name = [
      person[0]?.prefix?.join(' '),
      person[0]?.given?.join(' '),
      person[0]?.family,
      person[0]?.suffix?.join(' ')
    ].join(' ');
  }
  return name;
}

export function createDocumentReference(
  data: string,
  labelOrCondition: string,
  patient: Patient
): DocumentReference {
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
  patientRecords: DomainResource[],
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
          const obs = record as Observation;
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
            const obs = record as Observation;
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

export function createCarePlan(title: string, patient: Patient): CarePlan {
  return {
    title,
    resourceType: 'CarePlan',
    text: {
      status: R4.NarrativeStatusKind._generated,
      div: `<div> Assignment of patient to pathway ${title} </div>`
    },
    status: 'active',
    intent: 'plan',
    category: [
      {
        coding: [
          {
            system: 'http://hl7.org/fhir/us/core/CodeSystem/careplan-category',
            code: 'assess-plan'
          }
        ]
      }
    ],
    subject: { reference: `Patient/${patient.id}` }
  };
}

export function getSelectedPathways(
  patientRecords: DomainResource[],
  evaluatedPathways: EvaluatedPathway[]
): string[] {
  // Get all active CarePlan resource titles
  const carePlanTitles = (patientRecords.filter(r => r.resourceType === 'CarePlan') as CarePlan[])
    .filter(r => r.status === 'active')
    .map(r => r.title);

  // Check to see if any of the pathway names are in carePlanTitles
  const selectedPathways = evaluatedPathways
    .map(p => p.pathway.name)
    .filter(n => carePlanTitles.includes(n));

  return selectedPathways;
}

export function pathwayIsSelected(
  patientRecords: DomainResource[],
  pathway: Pathway | undefined
): boolean {
  if (!pathway) return false;

  // Get all active CarePlan resource titles
  const carePlanTitles = (patientRecords.filter(r => r.resourceType === 'CarePlan') as CarePlan[])
    .filter(r => r.status === 'active')
    .map(r => r.title);

  return carePlanTitles.includes(pathway.name);
}

export function getTNM(mcodeElements: McodeElements): string {
  const tnm = [
    mcodeElements['Tumor Category']?.split(' ')[0],
    mcodeElements['Node Category']?.split(' ')[0],
    mcodeElements['Metastases Category']?.split(' ')[0]
  ].join(' ');
  return tnm === '   ' ? 'Unknown' : tnm;
}
