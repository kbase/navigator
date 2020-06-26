import { getCookie } from './cookies';
import Config from '../config';

const CONFIG = Config.Instance;

/**
 * If the token isn't found, returns ''.
 */
export function getToken() : string {
  let token;
  try {
    token = getCookie('kbase_session');
  } catch (e) {
    token = window._env.token;
  }
  if (!token) {
    token = '';
  }
  return token;
}

// Fetch the username from the auth server or from session storage
// Calls the given callback with the username (or `null`)
export function getUsername(callBack: (username: string | null) => void) {
  if (!getToken()) {
    callBack(null);
  }
  else if (sessionStorage.getItem('kbase_username')) {
    callBack(sessionStorage.getItem('kbase_username'));
  }
  else {
    makeAuthCall('/token')
      .then(json => {
        const username = json.user;
        sessionStorage.setItem('kbase_username', username);
        callBack(username);
      })
      .catch(reason => console.error(reason));
  }
}

export async function getUsernames(userIds: string[]): Promise<{[key: string]: string}> {
  const encodedUsers = userIds.map((u) => encodeURIComponent(u));
  const operation = '/users/?list=' + encodedUsers.join(',');
  return makeAuthCall(operation);
}

export async function searchUsernames(query: string, options?: string[]): Promise<{[key: string]: string}> {
  let operation = '/users/search/' + query;
  if (options) {
    operation += '/?fields=' + options.join(',');
  }
  return makeAuthCall(operation);
}

function makeAuthCall(operation: string): Promise<any> {
  const token = getToken();
  if (!token) {
    throw new Error('Auth token not available.');
  }
  const headers = { Authorization: token };
  return fetch (CONFIG.service_routes.auth + operation, {
    method: 'GET',
    headers,
  })
    .then(resp => resp.json())
}
