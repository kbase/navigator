export {};
import Runtime from '../utils/runtime';
import { DynamicServiceClient } from '../api/serviceWizard';

export async function fetchProfileAPI(username: string) {
  let token = Runtime.token();
  if (!token) {
    throw new Error('Tried to fetch profile info without a token.');
  }
  const serviceWizardClient = new DynamicServiceClient({
    moduleName: 'bff',
    wizardUrl: Runtime.getConfig().service_routes.service_wizard,
    version: 'beta',
  });

  const bffServiceUrl = await serviceWizardClient.getServiceUrl();
  let url = bffServiceUrl + '/fetchUserProfile/' + username;
  const response = await fetch(url, {
    method: 'GET',
  });
  if (response.status !== 200) {
    console.warn(response.status, response);
  } else {
    try {
      return await response.json();
    } catch (err) {
      console.error('profile fetch failed', response);
    }
  }
}
