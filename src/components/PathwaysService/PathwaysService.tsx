import { useState, useEffect } from 'react';
import { Service } from 'pathways-objects';
import { Pathway } from 'pathways-model';

function getPathways(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });
}

function typedFetch<T>(url: string, options?: object): Promise<T> {
  return fetch(url, options).then(response => response.json() as Promise<T>);
}

const useGetPathwaysService = (url: string): Service<Pathway[]> => {
  const [result, setResult] = useState<Service<Array<Pathway>>>({
    status: 'loading'
  });

  useEffect(() => {
    getPathways(url)
      .then(response => response.json() as Promise<Array<string>>)
      .then(listOfFiles => listOfFiles.map(f => typedFetch<Pathway>(url + '/' + f)))
      .then(listOfPromises => Promise.all(listOfPromises))
      .then(pathwaysList => setResult({ status: 'loaded', payload: pathwaysList }))
      .catch(error => setResult({ status: 'error', error }));
  }, [url]);

  return result;
};

export default useGetPathwaysService;
