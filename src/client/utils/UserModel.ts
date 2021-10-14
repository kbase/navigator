import { KBaseServiceClient } from '@kbase/narrative-utils';
import Runtime from './runtime';

export interface UserProfile {
  user: {
    username: string;
    realname: string;
  };
  profile: {
    synced: {
      gravatarHash: string;
    };
    userdata: {
      avatarOption: string;
      gravatarDefault: string;
    };
  };
}

const userProfileCache: Map<string, UserProfile> = new Map();

export default class UserModel {
  token: string;
  constructor(token: string) {
    this.token = token;
  }

  clearCache() {
    userProfileCache.clear();
  }

  async fetchProfiles(usernames: string[]): Promise<Array<UserProfile | null>> {
    const userProfiles: Array<UserProfile> = [];

    // Get cached users, and build a list of non-cached users to fetch.
    const usersToFetch: Array<string> = [];
    for (const username of usernames) {
      if (userProfileCache.has(username)) {
        userProfiles.push(userProfileCache.get(username)!);
      } else {
        usersToFetch.push(username);
      }
    }

    const client = new KBaseServiceClient({
      module: 'UserProfile',
      url: Runtime.getConfig().service_routes.user_profile,
      authToken: this.token,
    });

    const profiles = (await client.call('get_user_profile', [
      usersToFetch,
    ])) as Array<UserProfile | null>;

    profiles.forEach((profile: UserProfile | null, index: number) => {
      if (profile === null) {
        throw new Error(`User profile not found for "${usersToFetch[index]}"`);
      }
      userProfiles.push(profile);
      userProfileCache.set(profile.user.username, profile);
    });
    return userProfiles;
  }

  async fetchProfile(username: string): Promise<UserProfile> {
    const [userProfile] = await this.fetchProfiles([username]);
    if (userProfile === null) {
      throw new Error(`User profile not found for "${username}`);
    }
    return userProfile;
  }
}
