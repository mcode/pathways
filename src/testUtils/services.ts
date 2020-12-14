import { Pathway } from 'pathways-model';
import { Service } from 'pathways-objects';

export const loadingService: Service<Array<Pathway>> = {
  status: 'loading'
};

export const loadedService: Service<Array<Pathway>> = {
  status: 'loaded',
  payload: [
    {
      id: '1',
      name: 'test1',
      description: 'test1',
      library: [],
      preconditions: [
        {
          id: 'asdfg',
          elementName: 'condition',
          expected: 'breast cancer',
          cql: 'some fancy CQL statement'
        }
      ],
      nodes: {
        Start: {
          key: 'Start',
          label: 'Start',
          type: 'start',
          transitions: []
        }
      }
    },
    {
      id: '2',
      name: 'test2',
      description: 'test2',
      library: [],
      preconditions: [
        {
          id: 'qwerty',
          elementName: 'condition',
          expected: 'gist cancer',
          cql: 'some fancy CQL statement'
        }
      ],
      nodes: {
        Start: {
          key: 'Start',
          label: 'Start',
          type: 'start',
          transitions: []
        }
      }
    },
    {
      id: '3',
      name: 'test3',
      description: 'test3',
      library: [],
      preconditions: [
        {
          id: 'zxcvb',
          elementName: 'condition',
          expected: 'lung cancer',
          cql: 'some fancy CQL statement'
        }
      ],
      nodes: {
        Start: {
          key: 'Start',
          label: 'Start',
          type: 'start',
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
