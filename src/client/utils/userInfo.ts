// as of now eslint cannot detect when imported interfaces are used
import { KBaseCache } from './narrativeData'; // eslint-disable-line no-unused-vars
import Runtime from '../utils/runtime';

function getUserProfileServiceUrl() {
  const token = Runtime.token();
  if (!token) {
    throw new Error('Tried to fetch profile info without a token.');
  }
  return Runtime.getConfig().service_routes.user_profile;
}

export async function fetchProfiles(usernames: string[], cache: KBaseCache) {
  const serviceUrl = getUserProfileServiceUrl();
  if (usernames.every(username => username in cache)) {
    return usernames.map(username => cache[username]);
  }
  const body = {
    method: 'UserProfile.get_user_profile',
    params: [usernames],
  };

  const resp = await fetch(serviceUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (resp.status !== 200) {
    throw new RangeError(`HTTP status not OK: ${resp.status}`);
  }
  // console.log('resp', await resp.text());
  const profiles = (await resp.json()).result[0];
  profiles.forEach((profile: any) => {
    if (profile && profile.user && profile.user.username) {
      cache[profile.user.username] = profile;
    }
  });
  return profiles;
}

export async function fetchProfile(
  username: string,
  cache: KBaseCache = {}
) {
  let profileArr;
  try {
    profileArr = await fetchProfiles([username], cache);
  } catch (err) {
    if (err instanceof RangeError) return null;
    throw err;
  }
  const profile = profileArr[0];
  return profile;
}
