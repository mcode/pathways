declare module 'fhir-visualizers' {
  import React, { Component } from 'react';
  import { Patient, DomainResource } from 'fhir-objects';

  type PatientVisualizerProps = {
    patient: Patient;
  };

  type RowProps = {
    rows: ReadonlyArray<DomainResource>;
  };

  export class PatientVisualizer extends Component<PatientVisualizerProps> {}
  export class ConditionsVisualizer extends Component<RowProps> {}
  export class CarePlansVisualizer extends Component<RowProps> {}
  export class EncountersVisualizer extends Component<RowProps> {}
  export class ImmunizationsVisualizer extends Component<RowProps> {}
  export class MedicationsVisualizer extends Component<RowProps> {}
  export class ObservationsVisualizer extends Component<RowProps> {}
  export class ProceduresVisualizer extends Component<RowProps> {}
  export class ReportsVisualizer extends Component<RowProps> {}
  export class AllergiesVisualizer extends Component<RowProps> {}
}
