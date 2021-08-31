/**
 * @jest-environment jsdom
 */
import { enableFetchMocks } from 'jest-fetch-mock';
import { getToken, getUsername, getUsernames, searchUsernames } from '../auth';
enableFetchMocks();

const token = 'someAuthToken';

describe('getToken tests', () => {
  beforeEach(() => {
    document.cookie = `kbase_session=${token}`;
  });

  test('getToken should retrieve token', () => {
    expect(getToken()).toEqual(token);
  });

  test('getToken should return undefined if no cookie is set', () => {
    document.cookie = 'kbase_session=';
    expect(getToken()).toEqual('');
  });
});

describe('getUsername tests', () => {
  beforeEach(() => {
    document.cookie = `kbase_session=${token}`;
  });

  it('Should return null if there is no token', (done) => {
    document.cookie = `kbase_session=`;
    getUsername((username) => {
      expect(username).toBeNull();
      done();
    });
  });

  it('Should return a username if there is a token', (done) => {
    fetchMock.mockOnce(async (req) => {
      return {
        status: 200,
        body: JSON.stringify({ user: 'some user' }),
      };
    });
    getUsername((username) => {
      expect(username).toBe('some user');
      done();
    });
  });

  it('Should log a message if there is some other error', (done) => {
    fetchMock.mockOnce(async (req) => {
      return {
        status: 200,
        body: '',
      };
    });
    expect(getUsername((username) => {})).toBeUndefined();
    done();
  });
});

describe('getUsernames tests', () => {
  const usermap = {
    user1: 'User One',
    user2: 'User Two',
  };
  beforeEach(() => {
    document.cookie = `kbase_session=${token}`;
  });

  it('Should throw an error if the auth token is missing', async () => {
    document.cookie = `kbase_session=`;
    await expect(() => getUsernames(Object.keys(usermap))).rejects.toThrow();
  });

  it('Should return a username map', async () => {
    fetchMock.doMock(async (req) => {
      return JSON.stringify(usermap);
    });
    const users = await getUsernames(Object.keys(usermap));
    expect(users).toEqual(usermap);
  });
});

describe('searchUsernames tests', () => {
  const usermap = {
    user1: 'User One',
    user2: 'User Two',
  };
  beforeEach(() => {
    document.cookie = `kbase_session=${token}`;
  });

  it('Should throw an error if the auth token is missing', async () => {
    document.cookie = `kbase_session=`;
    await expect(() => searchUsernames('user')).rejects.toThrow();
  });

  it('Should return a username map', async () => {
    fetchMock.doMock(async (req) => {
      return JSON.stringify(usermap);
    });
    const users = await searchUsernames('user');
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(
      /auth\/api\/V2\/users\/search\/user$/
    );
    expect(users).toEqual(usermap);
  });

  it('Should include optional fields with URL formatting', async () => {
    fetchMock.doMock(async (req) => {
      return JSON.stringify(usermap);
    });
    const users = await searchUsernames('us', ['a', 'b', 'c']);
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(
      /auth\/api\/V2\/users\/search\/us\/\?fields=a,b,c$/
    );
    expect(users).toEqual(usermap);
  });
});
