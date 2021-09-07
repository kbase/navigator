/**
 * @jest-environment jsdom
 */
import { enableFetchMocks } from 'jest-fetch-mock';
import UserModel from '../UserModel';

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

describe('The UserModel class fetchProfile method', () => {
  const userId = 'someuser';
  const userName = 'Some User';
  const someMockProfile = mockProfile(userId, userName);

  test('should return a profile', async () => {
    fetchMock.mockOnce(async (req) => {
      return {
        status: 200,
        body: JSON.stringify(someMockProfile),
      };
    });
    const userModel = new UserModel('token');
    userModel.clearCache();
    const profile = await userModel.fetchProfile(userId);
    expect(true).toBeTruthy();
    expect(profile).toBeDefined();
    expect(profile.user).toBeDefined();
    expect(profile.user.username).toEqual(userId);
    expect(profile.user.realname).toEqual(userName);
  });

  // // DISABLE - will not compile without a token, and if an invalid token
  // // is to be provided, we need to mock the user profile call
  test.skip('should fail without a token', async () => {
    const userModel = new UserModel('token');
    await expect(() => userModel.fetchProfile(userId)).rejects.toThrow();
  });

  // TODO: really? should it? fetching a profile for a non-existent user
  // should (does) return null from the UserProfile service; an error
  // response should probably throw an exception, and the user of the call
  // can decide what to do.
  test('should throw with anything beside a 200', async () => {
    fetchMock.mockOnce(async () => {
      return {
        status: 404,
        body: 'Not Found',
      };
    });
    const userModel = new UserModel('token');
    userModel.clearCache();
    await expect(() => {
      return userModel.fetchProfile(userId);
    }).rejects.toThrow();
  });

  // Note that this actually triggers code failure conditions, as this condition is
  // not actually detected. In other words, the code in UserModel expects a correct
  // api response and treats it as such.
  test('should throw an error if the data received is not compliant', async () => {
    fetchMock.mockOnce(async () => {
      return {
        status: 200,
        body: '{}',
      };
    });
    const userModel = new UserModel('token');
    userModel.clearCache();
    await expect(() => {
      return userModel.fetchProfile(userId);
    }).rejects.toThrow();
  });

  test('should throw an error if it does not receive valid JSON', async () => {
    fetchMock.mockOnce(async (req) => {
      return {
        status: 200,
        body: 'NOT REAL JSON',
      };
    });
    const userModel = new UserModel('token');
    userModel.clearCache();
    await expect(() => {
      return userModel.fetchProfile(userId);
    }).rejects.toThrow();
  });

  // // DISABLED - cache is internal, so testing the cache behavior from outside the
  // // black box needs more work.
  // test.skip('should consult the cache first', async () => {
  //   const userModel = new UserModel('token');
  //   userModel.clearCache();
  //   expect(await userModel.fetchProfile(userId)).toBe(someMockProfile);
  // });

  // // DISABLED - cache is internal, so testing the cache behavior from outside the
  // // black box needs more work.
  test.skip('fetchProfiles should not cache if profile is broken', async () => {
    fetchMock.mockOnce(async (req) => {
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
    const userModel = new UserModel('token');
    userModel.clearCache();
    await userModel.fetchProfiles([
      userId,
      'profileNoUser',
      'profileNoUserName',
    ]);
    // expect(JSON.stringify(cache)).toBe('{}');
  });
});
