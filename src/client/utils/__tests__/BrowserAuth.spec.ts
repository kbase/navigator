/**
 * @jest-environment jsdom
 */
import { BrowserAuth } from '../BrowserAuth';

const token = 'someAuthToken';
const cookieName = 'kbase_session';

describe('The BrowserAuth class', () => {
  test('getToken method should retrieve a token from the KBase session cookie', () => {
    document.cookie = `${cookieName}=${token}`;
    expect(BrowserAuth.getToken()).toEqual(token);
  });

  test('getToken method should return null if no cookie is present', () => {
    document.cookie = `${cookieName}=; max-age=0`;
    expect(BrowserAuth.getToken()).toBeNull();
  });

  test('getToken method should return null if the cookie is expired', () => {
    document.cookie = `${cookieName}=${token}; max-age=0`;
    expect(BrowserAuth.getToken()).toBeNull();
  });

  test('removeToken method should remove the kbase session cookie', () => {
    document.cookie = `${cookieName}=${token}`;
    expect(BrowserAuth.getToken()).toEqual(token);

    BrowserAuth.removeToken();
    expect(BrowserAuth.getToken()).toBeNull();
  });
});
