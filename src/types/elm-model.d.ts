declare module 'elm-model' {
  export interface ElmLibrary {
    library: {
      identifier: {
        id: string;
        version: string;
      };
      schemaIdentifier: {
        id: string;
        version: string;
      };
      usings?: {
        def: ElmUsing[];
      };
      includes?: {
        def: ElmIncludes[];
      };
      valueSets?: {
        def: ElmValueSet[];
      };
      codes?: {
        def: ElmCode[];
      };
      codeSystems?: {
        def: ElmCodeSystem[];
      };
      concepts?: {
        def: object[];
      };
      statements: {
        def: ElmStatement[];
      };
      [x: string]: object;
    };
  }

  export interface ElmUsing {
    uri: string;
    localIdentifier: string;
    localId?: string;
    locator?: string;
    version?: string;
  }

  export interface ElmIncludes {
    path: string;
    version: string;
    localId?: string;
    locator?: string;
    localIdentifier?: string;
  }

  export interface ElmValueSet {
    id: string;
    name: string;
    localId?: string;
    locator?: string;
    accessLevel: string;
    resultTypeSpecifier: object;
  }

  export interface ElmCode {
    id: string;
    name: string;
    display: string;
    codeSystem: {
      name: string;
    };
    accessLevel: string;
  }

  export interface ElmCodeSystem {
    id: string;
    name: string;
    accessLevel: string;
  }

  export interface ElmStatement {
    name: string;
    context: string;
    expression: object;
    locator?: string;
    locatorId?: string;
    accessLevel?: string;
    resultTypeName?: string;
    annotation?: object[];
  }
}
