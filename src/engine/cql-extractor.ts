import { Pathway, PathwayNode } from 'pathways-model';

export interface CqlObject {
  main: string;
  libraries: Library;
}

export interface Library {
  [name: string]: string; // should probably have an object for expected ELM structure.
}

/**
 * Function to format each block from the pathway in CQL format
 * @param cqlBlock - block of CQL code from the pathway
 * @param resourceName - Name of the CQL resource block to be defined
 * @return the CQL code formatted pretty with the define line
 */
function cqlFormat(cqlBlock: string, resourceName: string): string {
  let formattedBlock = '';

  // Definition of CQL block
  const line1 = 'define "' + resourceName + '":\n\t';

  // Build the formatted block
  formattedBlock = line1.concat(cqlBlock);
  return formattedBlock;
}

/**
 * Helper function to add the cql block to the completed cql
 * with the correct formatting
 * @param cql - complete cql string
 * @param cqlBlock - current cql block to append to the cql
 * @return the cql with the cql block appended correctly
 */
function cqlAdd(cql: string, cqlBlock: string): string {
  return cql.concat('\n', '\n', cqlBlock);
}

/**
 * Function to extract the CQL code from the pathway and build
 * the CQL code to execute
 * @param pathway - the JSON object of the entire pathway
 * @return a string of the CQL code for the navigational nodes in the pathway
 */
export function extractNavigationCQL(pathway: Pathway): Promise<CqlObject> {
  // TODO: this no longer needs to be async,
  //  but it's easier to just wrap it in a promise than change what calls it
  return new Promise((resolve, reject) => {
    // we no longer need to construct a new library here, 
    // as the builder constructed one for us, 
    // and it's the first entry in pathway.library
    // subsequent libraries are dependencies
    const libraries: { [k: string]: string } = {};

    pathway.library.slice(1).forEach(l => {
      const n = libName(l);
      libraries[n] = l;
    });

    resolve({ main: pathway.library[0], libraries });
  });
}

/**
 * Extract the CQL statements from the `preconditions` section of the pathway
 * into a snippet ready to be converted to ELM.
 * @param pathway - the entire pathway object
 * @return a string of the CQL for the preconditions in the pathway
 */
export function extractPreconditionCQL(pathway: Pathway): Promise<CqlObject> {
  // TODO: as above, this no longer needs to be async,
  // but easier to just wrap it in a promise
  return new Promise((resolve, reject) => {
    const libraries: { [k: string]: string } = {};
    // pathway.library.forEach(l => libraries[libName(l)] = l);

    // TODO: this is super duplicative
    const includedLibs: IncludedCqlLibraries = {};

    pathway.library.forEach(l => {
      const n = libName(l);
      const v = libVersion(l);
      libraries[n] = l;
      includedLibs[n] = { cql: 'dummy text', version: v };
    });

    let cql = constructCqlLibrary(pathway.id, includedLibs, {}, {});
    // Loop through each JSON object in the pathway
    // TODO: can we make this work with the constructCqlLibrary function?
    for (const precondition of pathway.preconditions) {
      const cqlBlock1 = precondition.cql;
      const nextBlock1 = cqlFormat(cqlBlock1, precondition.elementName);
      cql = cqlAdd(cql, nextBlock1);
    }

    resolve({ main: cql, libraries });
  });
}

export function libName(library: string): string {
  // assumption is all CQL libraries will start with a line like this:
  // library CMS153_CQM version '2'
  // or possibly some comments or blank lines first
  // TODO: can library names be quoted and contain spaces?
  // TODO: are multiple spaces allowed?
  const lines = library.split('\n');
  const libraryLine = lines.find(l => l.trim().startsWith('library '));

  if (!libraryLine) {
    throw new Error(`cql does not contain a library name: ${library}`);
  }

  const trimmed = libraryLine.trim(); // juuust in case

  const firstSpace = trimmed.indexOf(' ');
  const secondSpace = trimmed.indexOf(' ', firstSpace + 1);

  // +1 so we don't actually include that first space in the substring
  let name = trimmed.substring(firstSpace + 1, secondSpace);

  if (name.startsWith('"')) {
    // slice is like substring, but negative numbers count from the end
    name = name.slice(1, -1);
  }
  return name;
}

export function libVersion(library: string): string {
  // assumption is all CQL libraries will start with a line like this:
  // library CMS153_CQM version '2'
  // or possibly some comments or blank lines first
  // TODO: can library names be quoted and contain spaces?
  // TODO: are multiple spaces allowed?
  const lines = library.split('\n');
  const libraryLine = lines.find(l => l.trim().startsWith('library '));

  if (!libraryLine) {
    throw new Error(`cql does not contain a library name: ${library}`);
  }

  const trimmed = libraryLine.trim(); // juuust in case
  const firstSpace = trimmed.indexOf('version') + 8;
  let secondSpace = trimmed.indexOf(' ', firstSpace + 1);
  if (secondSpace === -1) {
    secondSpace = trimmed.length; // assume the version # ends the line
  }

  // +/-1 so we don't include the quotes
  return trimmed.substring(firstSpace + 1, secondSpace - 1);
}

// below copied directly from the builder:
// https://github.com/mcode/pathway-builder/blob/5ad37dce6d/src/utils/export.ts
// keep these up to date

// interface purely for intermediate working objects
export interface IncludedCqlLibraries {
  [id: string]: {
    cql: string;
    version: string;
  };
}

/**
 * Constructs a CQL Library based on the provided CQL
 *
 * @param libraryName - The name to be used in the library
 * @param includedCqlLibraries - Libraries that should be included
 * @param referencedDefines - Definitions that should be defined in the constructed library
 *                            based on a definition in an included library
 * @param builderDefines - Definitions from the CQL builder that should be included
 */
export function constructCqlLibrary(
  libraryName: string,
  includedCqlLibraries: IncludedCqlLibraries,
  referencedDefines: Record<string, string>,
  builderDefines: Record<string, string>
): string {
  const includes = Object.entries(includedCqlLibraries)
    .map(([name, details]) => `include "${name}" version '${details.version}' called ${name}\n\n`)
    .join('');
  const definesList = Object.entries(referencedDefines).map(
    ([name, srcLibrary]) => `define "${name}": ${srcLibrary}.${name}\n\n`
  );

  Object.entries(builderDefines).forEach(([statement, cql]) =>
    definesList.push(`define "${statement}": ${cql}\n\n`)
  );

  const defines = definesList.join('');

  // NOTE: this library should use the same FHIR version as all referenced libraries
  // and if we want to run it in cqf-ruler, as of today that needs to be FHIR 4.0.1 (NOT 4.0.0)
  return `
library ${libraryName} version '1.0'
using FHIR version '4.0.1'
${includes}
context Patient
${defines}
`;
}
