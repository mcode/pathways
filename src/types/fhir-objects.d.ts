declare module 'fhir-objects' {
  import { R4 } from '@ahryman40k/ts-fhir-types';

  type DomainResourceR4 = R4.IDomainResource & { resourceType: string };
  type ResourceR4 = R4.IResource & { resourceType: string };
  type DocumentReferenceR4 = R4.IDocumentReference & { status: string };

  export type Address = fhir.Address | R4.IAddress;
  export type DomainResource = fhir.DomainResource | DomainResourceR4;
  export type DocumentReference = fhir.DocumentReference | DocumentReferenceR4;
  export type HumanName = fhir.HumanName | R4.IHumanName;
  export type Identifier = fhir.Identifier | R4.IIdentifier;
  export type Observation = fhir.Observation | R4.IObservation;
  export type Patient = fhir.Patient | R4.IPatient;
  export type Practitioner = fhir.Practitioner | R4.IPractitioner;
  export type Procedure = fhir.Procedure | R4.IProcedure;
  export type Resource = fhir.Resource | ResourceR4;
  export type Bundle = fhir.Bundle | R4.IBundle;
  export type ServiceRequest = fhir.ProcedureRequest | R4.IServiceRequest;
  export type MedicationRequest = fhir.MedicationRequest | R4.IMedicationRequest;
  export type CarePlan = R4.ICarePlan;
}
