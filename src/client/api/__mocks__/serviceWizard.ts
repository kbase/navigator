export class DynamicServiceClient {
  public async getServiceUrl() {
    return 'https://env.kbase.us/services/some_special_url';
  }

  public async call(method: string, params: Array<any>) {
    return [{}];
  }
}
