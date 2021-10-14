/**
 * @jest-environment jsdom
 */

import { getCookie, removeCookie } from '../cookies';

describe('The getCookie function', () => {
  const cookieName = 'some_cookie';
  const cookieValue = 'some_value';
  beforeEach(() => {
    document.cookie = `${cookieName}=${cookieValue}`;
  });

  test('should fetch a cookie if present in the browser', () => {
    expect(getCookie(cookieName)).toEqual(cookieValue);
  });

  test('should return null if a cookie is not present in the browser', () => {
    const cookieValue = getCookie('not_a_real_cookie');
    expect(cookieValue).toBeNull();
  });
});

describe('The removeCookie function', () => {
  const cookieName = 'some_cookie';
  const cookieValue = 'some_value';
  beforeEach(() => {
    document.cookie = `${cookieName}=${cookieValue}`;
  });

  test('should remove a cookie', () => {
    expect(getCookie(cookieName)).toEqual(cookieValue);
    removeCookie(cookieName);
    expect(getCookie(cookieName)).toBeNull();
  });

  test('should succeed with a cookie not present in the browser', () => {
    removeCookie('not_a_real_cookie'); // just run it, shouldn't fail.
  });
});
