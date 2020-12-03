import { Pathway } from 'pathways-model';

export interface CqlObject {
  main: string;
  libraries: Library;
}

export interface Library {
  [name: string]: string; // should probably have an object for expected ELM structure.
}

/**
 * Function to extract the CQL code from the pathway and build
 * the CQL code to execute
 * @param pathway - the JSON object of the entire pathway
 * @return a string of the CQL code for the navigational nodes in the pathway
 */
export function extractCQL(pathway: Pathway): Promise<CqlObject> {
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
