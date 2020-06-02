export {};
import Runtime from '../utils/runtime';

async function getBFFServiceUrl(token: string) {
  let versionNum: number | null = null;
  let url: string = Runtime.getConfig().service_routes.service_wizard;

  const body = {
    id: 0,
    method: 'ServiceWizard.get_service_status',
    version: '1.1',
    params: [
      {
        module_name: 'bff',
        version: versionNum,
      },
    ],
  };
  const stringBody = JSON.stringify(body);
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      Authorization: token,
    },
    body: stringBody,
  });
  if (response.status !== 200) {
    // return empty string so that the fetch API called this function
    // can generate error messages.
    return '';
  } else {
    const responseJson = await response.json();
    return responseJson.result[0]['url'];
  }
}

export async function fetchProfileAPI(username: string) {
  let token = Runtime.token();
  if (!token) {
    throw new Error('Tried to fetch profile info without a token.');
  }
  const bffServiceUrl = await getBFFServiceUrl(token);
  let url = bffServiceUrl + '/fetchUserProfile/' + username;
  const response = await fetch(url, {
    method: 'GET',
  });
  if (response.status !== 200) {
    console.warn(response.status, response);
    // return [response.status, response.statusText];
  } else {
    try {
      return await response.json();
    } catch (err) {
      console.error('profile fetch failed', response);
      // return [response.status, response.statusText];
    }
  }
}
