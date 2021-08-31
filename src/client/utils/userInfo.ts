import { KBaseJsonRpcError, KBaseServiceClient } from '@kbase/narrative-utils';
import { KBaseCache } from './narrativeData';
import Runtime from '../utils/runtime';

export async function fetchProfiles(usernames: string[], cache: KBaseCache) {
  if (usernames.every((username) => username in cache)) {
    return usernames.map((username) => cache[username]);
  }
  const client = new KBaseServiceClient({
    module: 'UserProfile',
    url: Runtime.getConfig().service_routes.user_profile,
    authToken: Runtime.token(),
  });
  const profiles = await client.call('get_user_profile', [usernames]);
  profiles.forEach((profile: any) => {
    if (profile && profile.user && profile.user.username) {
      cache[profile.user.username] = profile;
    }
  });
  return profiles;
}

export async function fetchProfile(username: string, cache: KBaseCache = {}) {
  let profileArr;
  try {
    profileArr = await fetchProfiles([username], cache);
  } catch (err) {
    if (err instanceof KBaseJsonRpcError) {
      if ('code' in err && err.code !== 200) {
        return null;
      }
    }
    throw err;
  }
  const profile = profileArr[0];
  return profile;
}
