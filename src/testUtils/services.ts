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
      states: {
        test: 'okay'
      }
    },
    {
      name: 'test2',
      description: 'test2',
      library: 'test.cql',
      states: {
        test: 'okay'
      }
    },
    {
      name: 'test3',
      description: 'test3',
      library: 'test.cql',
      states: {
        test: 'okay'
      }
    }
  ]
};

export const errorService: Service<Array<Pathway>> = {
  status: 'error',
  error: new TypeError('error')
};
