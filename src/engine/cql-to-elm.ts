// External CQL -> ELM service
import {CqlObject} from './cql-extractor';
import config from 'utils/ConfigManager';

const url = config.get('cqlToElmWebserviceUrl');

export interface ElmObject {
    main : object
    libraries: {
        [key: string]: object
    }
}

/**
 * Function that requests web_service to convert the cql into elm.
 * @param cql - cql file that is the input to the function.
 * @return The resulting elm translation of the cql file.
 */
export default function convertCQL(cql: CqlObject): Promise<ElmObject> {
  // Connect to web service
  const formdata = new FormData();
  Object.keys(cql.libraries).forEach((key, i)=>{
      formdata.append(`${key}`,cql.libraries[key]);
  })

  formdata.append("main", cql.main);
  return fetch(url, {
    method: 'POST',
    body: formdata
  }).then((elm) => {
      let header = elm.headers.get("content-type");
      let boundary = "";
      if(header) {
          const result = header.match(/(?<=boundary=)Boundary.*/g)
          boundary = result ? `--${result[0]}` : "";
      }
      const obj: ElmObject = {main:{},libraries:{}};
      return elm.text().then((text)=>{
          let elms = text.split(boundary).reduce((oldArray, line, i)=>{
              const x = line.match(/(?<=Content-Type[^]+Content-Disposition.*[\r\n]+)[^]+/g);
              if ( x ) {
                const elmName = line.match(/(?<=name=").+(?=")/g);
                if(elmName && elmName[0] === "main") {
                    oldArray[elmName[0]] = JSON.parse(x[0]);
                } else if(elmName) {
                    oldArray.libraries[elmName[0]] = JSON.parse(x[0])
                }
              }
              return oldArray;
          },obj)

          return elms;
      })});
};

export function convertBasicCQL(cql: string): Promise<object> {
    // Connect to web service
  
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/cql',
        Accept: 'application/elm+json'
      },
      body: cql
    }).then(elm => elm.json());
  }
  