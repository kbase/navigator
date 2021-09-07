/**
 * @jest-environment jsdom
 */
import { enableFetchMocks } from 'jest-fetch-mock';
import { AuthService } from '../AuthService';

enableFetchMocks();

const token = 'someAuthToken';

describe('The AuthService getUsernames method', () => {
  const usermap = {
    user1: 'User One',
    user2: 'User Two',
  };

  it('should return a username map', async () => {
    fetchMock.doMock(async (req) => {
      return JSON.stringify(usermap);
    });
    const auth = new AuthService(token);
    auth.clearCache();
    const users = await auth.getUsernames(Object.keys(usermap));
    expect(users).toEqual(usermap);
  });
});

describe('The AuthService searchUsernames method', () => {
  const usermap = {
    user1: 'User One',
    user2: 'User Two',
  };

  it('should return a username map', async () => {
    fetchMock.doMock(async (req) => {
      return JSON.stringify(usermap);
    });
    const auth = new AuthService(token);
    auth.clearCache();
    const users = await auth.searchUsernames('user');
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(
      /auth\/api\/V2\/users\/search\/user$/
    );
    expect(users).toEqual(usermap);
  });

  it('should include optional fields with URL formatting', async () => {
    fetchMock.doMock(async (req) => {
      return JSON.stringify(usermap);
    });
    const auth = new AuthService('some_token');
    auth.clearCache();
    const users = await auth.searchUsernames('us', ['a', 'b', 'c']);
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(
      /auth\/api\/V2\/users\/search\/us\?fields=a,b,c$/
    );
    expect(users).toEqual(usermap);
  });
});
