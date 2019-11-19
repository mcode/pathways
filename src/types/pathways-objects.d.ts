declare module 'pathways-objects' {
  export interface Pathway {
    name: string;
    description?: string;
    library: string;
    states: Record<string, any>;
  }

  export interface Pathways {
    results: Pathway[];
  }

  interface ServiceInit {
    status: 'init';
  }
  interface ServiceLoading {
    status: 'loading';
  }
  interface ServiceLoaded<T> {
    status: 'loaded';
    payload: T;
  }
  interface ServiceError {
    status: 'error';
    error: Error;
  }
  export type Service<T> = ServiceInit | ServiceLoading | ServiceLoaded<T> | ServiceError;
}
