declare module 'cql-execution' {
  export class Library {
    constructor(elm: object, repo?: Repository);
  }

  export class Executor {
    constructor(library: Library);
    exec(patientsource: any);
  }

  export class Repository {
      constructor( elm: object );
  }
}
