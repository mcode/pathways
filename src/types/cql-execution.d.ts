declare module 'cql-execution' {
  export class Library {
    constructor(elm: object);
  }

  export class Executor {
    constructor(library: Library);
    exec(patientsource: any);
  }
}
