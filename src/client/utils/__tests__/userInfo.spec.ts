/**
 * @jest-environment jsdom
 */
import { enableFetchMocks } from 'jest-fetch-mock';
import { fetchProfile, fetchProfiles, cache } from '../userInfo';

enableFetchMocks();

const mockProfile = (userId: string, userName: string) => ({
  id: '12345',
  version: '1.1',
  result: [
    [
      {
        user: {
          username: userId,
          realname: userName,
        },
        profile: {
          metadata: { created: '2015-01-14T00:32:40.885Z' },
          userdata: {
            researchStatement: 'KBase!',
            jobTitle: 'Person',
            affiliations: [
              {
                organization: 'Lawrence Berkeley National Laboratory',
                started: 2012,
                title: 'Software Developer',
                ended: 'Present',
              },
            ],
            state: 'California',
            country: 'United States',
            city: 'Oakland',
            postalCode: '',
            fundingSource: '',
            gravatarDefault: 'identicon',
            avatarOption: '',
          },
          synced: {
            gravatarHash: '294da295adeac456edf84b40d8e714d6',
          },
          preferences: {},
        },
      },
    ],
  ],
});

describe('fetchProfile tests', () => {
  const token = 'someAuthToken';
  const userId = 'someuser';
  const userName = 'Some User';
  const someMockProfile = mockProfile(userId, userName);

  beforeEach(() => {
    cache.clear();
    document.cookie = `kbase_session=${token}`;
  });

  test('fetchProfile should return profile', async () => {
    fetchMock.mockOnce(async req => {
      return {
        status: 200,
        body: JSON.stringify(someMockProfile),
      };
    });
    const profile = await fetchProfile(userId);
    expect(profile).toBeDefined();
    expect(profile.user).toBeDefined();
    expect(profile.user.username).toEqual(userId);
    expect(profile.user.realname).toEqual(userName);
  });

  test('fetchProfile should fail without a token', async () => {
    document.cookie = `kbase_session=`;
    await expect(() => fetchProfile(userId)).rejects.toThrow();
  });

  test('fetchProfile should return null with anything beside a 200', async () => {
    fetchMock.mockOnce(async req => {
      return {
        status: 404,
        body: 'Not Found',
      };
    });
    const profile = await fetchProfile(userId);
    expect(profile).toBeNull();
  });

  test('fetchProfile should throw an error', async () => {
    fetchMock.mockOnce(async req => {
      return {
        status: 200,
        body: '{}',
      };
    });
    await expect(() => fetchProfile(userId)).rejects.toThrow();
  });

  test('fetchProfile should throw an error if it does not receive valid JSON', async () => {
    fetchMock.mockOnce(async req => {
      return {
        status: 200,
        body: 'NOT REAL JSON',
      };
    });
    await expect(() => fetchProfile(userId)).rejects.toThrow();
  });

  test('fetchProfile should consult the cache first', async () => {
    cache.set(userId, someMockProfile);
    expect(await fetchProfile(userId)).toBe(someMockProfile);
  });

  test('fetchProfiles should not cache if profile is broken', async () => {
    fetchMock.mockOnce(async req => {
      return {
        status: 200,
        body: JSON.stringify({
          id: '12345',
          version: '1.1',
          result: [
            [
              {
                [userId]: null,
                profileNoUser: {},
                profileNoUserName: { user: {} },
              },
            ],
          ],
        }),
      };
    });
    const cache = {};
    await fetchProfiles([userId, 'profileNoUser', 'profileNoUserName']);
    expect(JSON.stringify(cache)).toBe('{}');
  });
});
