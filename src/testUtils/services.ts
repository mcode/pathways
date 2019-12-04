import { Pathway, Service, Pathways } from 'pathways-objects';

export const loadingService: Service<Pathways> = {
  status: 'loading'
};

export const loadedService: Service<Pathways> = {
  status: 'loaded',
  payload: {
    results: [
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
  }
};

export const errorService: Service<Pathways> = {
  status: 'error',
  error: new TypeError('error')
};
