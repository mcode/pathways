class MockedFHIRClient {
  patient = {};

  async create(): Promise<string> {
    return Promise.resolve('Mocked Create');
  }
}

export { MockedFHIRClient };
