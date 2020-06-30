import { Pathway } from 'pathways-model';
import { Service } from 'pathways-objects';

export const loadingService: Service<Array<Pathway>> = {
  status: 'loading'
};

export const loadedService: Service<Array<Pathway>> = {
  status: 'loaded',
  payload: [
    {
      name: 'test1',
      description: 'test1',
      library: 'test.cql',
      precondition: [
        {
          elementName: 'condition',
          expected: 'breast cancer',
          cql: 'some fancy CQL statement'
        }
      ],
      nodes: {
        Start: {
          label: 'Start',
          transitions: []
        }
      }
    },
    {
      name: 'test2',
      description: 'test2',
      library: 'test.cql',
      precondition: [
        {
          elementName: 'condition',
          expected: 'gist cancer',
          cql: 'some fancy CQL statement'
        }
      ],
      nodes: {
        Start: {
          label: 'Start',
          transitions: []
        }
      }
    },
    {
      name: 'test3',
      description: 'test3',
      library: 'test.cql',
      precondition: [
        {
          elementName: 'condition',
          expected: 'lung cancer',
          cql: 'some fancy CQL statement'
        }
      ],
      nodes: {
        Start: {
          label: 'Start',
          transitions: []
        }
      }
    }
  ]
};

export const errorService: Service<Array<Pathway>> = {
  status: 'error',
  error: new TypeError('error')
};
