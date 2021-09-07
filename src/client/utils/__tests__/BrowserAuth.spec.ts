/**
 * @jest-environment jsdom
 */
import { BrowserAuth } from '../BrowserAuth';

const token = 'someAuthToken';
const cookieName = 'kbase_session';

describe('The BrowserAuth getToken method', () => {
  test('should retrieve a token from the KBase session cookie', () => {
    document.cookie = `${cookieName}=${token}`;
    expect(BrowserAuth.getToken()).toEqual(token);
  });

  test('should return null if no cookie is present', () => {
    document.cookie = `${cookieName}=; max-age=0`;
    expect(BrowserAuth.getToken()).toBeNull();
  });

  test('should return null if the cookie is expired', () => {
    document.cookie = `${cookieName}=${token}; max-age=0`;
    expect(BrowserAuth.getToken()).toBeNull();
  });
});
