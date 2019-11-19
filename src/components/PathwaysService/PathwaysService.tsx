import { useState, useEffect } from 'react';
import pathways from '../../utils/pathways.json';
import { Pathways, Service } from 'pathways-objects';

function getPathways(url?: string): Promise<Response> {
  // update this function for the api call.  Right now it mocks a
  // call to an api.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const response = new Response(JSON.stringify(pathways));
      resolve(response);
    }, 500);
  });
}
const useGetPathwaysService = (url: string) => {
  const [result, setResult] = useState<Service<Pathways>>({
    status: 'loading'
  });

  useEffect(() => {
    getPathways(url)
      .then(response => response.json())
      .then(pathwaysList => {
        // if the response is not already a list we will have to some
        // processing here
        setResult({ status: 'loaded', payload: pathwaysList });
      })
      .catch(error => setResult({ status: 'error', error }));
  }, [url]);

  return result;
};

export default useGetPathwaysService;
