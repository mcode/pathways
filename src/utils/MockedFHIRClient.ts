class MockedFHIRClient {
  patient = {};

  async create(): Promise<fhir.Resource> {
    console.log('Mocked create');
    return Promise.resolve({});
  }
}

export { MockedFHIRClient };
