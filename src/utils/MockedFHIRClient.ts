import { Resource } from 'fhir-objects';
class MockedFHIRClient {
  patient = {};

  async create(): Promise<Resource> {
    console.log('Mocked create');
    return Promise.resolve({});
  }
}

export { MockedFHIRClient };
