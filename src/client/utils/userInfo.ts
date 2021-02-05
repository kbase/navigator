import { KBaseServiceClient } from '@kbase/narrative-utils';
// as of now eslint cannot detect when imported interfaces are used
import Runtime from '../utils/runtime';
import Cache from './Cache';

// TODO: type UserProfile
type UserProfile = any;

export const cache = new Cache<UserProfile>();

export async function fetchProfiles(usernames: string[]) {
  // Get the profile that are already cached
  const [found, toFetch] = usernames.reduce<[Array<UserProfile>, Array<string>]>(([found, toFetch], username) => {
    if (cache.has(username)) {
      return [[cache.get(username), ...found], toFetch];
    } else {
      return [found, [username, ...toFetch]];
    }
  }, [[], []]);

  // Fetch the remainder.
  if (toFetch.length === 0) {
    return found;
  }
  const client = new KBaseServiceClient({
    module: 'UserProfile',
    url: Runtime.getConfig().service_routes.user_profile,
    authToken: Runtime.token(),
  });
  const profiles = await client.call('get_user_profile', [toFetch]);

  // Cache any fetch profiles.
  profiles.forEach((profile: UserProfile) => {
    if (profile && profile.user && profile.user.username) {
      cache.set(profile.user.username, profile);
    }
  });
  return profiles;
}

export async function fetchProfile(username: string) {
  let profileArr;
  try {
    profileArr = await fetchProfiles([username]);
  } catch (err) {
    if ('code' in err && err.code !== 200) {
      return null;
    }
    throw err;
  }
  const profile = profileArr[0];
  return profile;
}
