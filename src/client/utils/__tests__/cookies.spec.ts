/**
 * @jest-environment jsdom
 */

import { getCookie, removeCookie } from '../cookies';

describe('cookie tests', () => {
  const cookieName = 'some_cookie';
  const cookieValue = 'some_value';
  beforeEach(() => {
    document.cookie = `${cookieName}=${cookieValue}`;
  });

  test('getCookie should fetch a cookie', () => {
    expect(getCookie(cookieName)).toEqual(cookieValue);
  });

  test('getCookie should throw an error for a missing cookie', () => {
    expect(() => getCookie('not_a_real_cookie')).toThrowError(
      'Unable to fetch non-existent cookie: not_a_real_cookie'
    );
  });

  test('removeCookie should remove a cookie', () => {
    expect(getCookie(cookieName)).toEqual(cookieValue);
    removeCookie(cookieName);
    expect(() => getCookie(cookieName)).toThrowError();
  });

  test('removeCookie should be a no-op on a cookie that does not exist', () => {
    removeCookie('not_a_real_cookie'); // just run it, shouldn't fail.
  });
});
