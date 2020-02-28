class MockedFHIRClient {
  patient = {};

  async create(): Promise<string> {
    console.log('Mocked create');
    return Promise.resolve('Mocked Create');
  }
}

export { MockedFHIRClient };
