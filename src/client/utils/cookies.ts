/**
 * Returns the value of a given cookie. If not present, throws an Error.
 * @param {string} name name of the cookie to fetch
 * @return {string}
 */
export function getCookie(name: string): string {
  const vals = document.cookie
    .split(';')
    .map(s => s.split('='))
    .filter(([key, val]) => key.trim() === name);
  if (vals && vals.length && vals[0].length === 2) {
    return vals[0][1];
  }
  throw new Error('Unable to fetch non-existent cookie: ' + name);
}

/**
 * Removes a cookie by setting its expiration date to the epoch.
 * @param {string} name name of cookie to remove
 */
export function removeCookie(name: string) {
  const date = new Date();
  date.setTime(date.getTime() + -1 * 24 * 60 * 60 * 1000);
  document.cookie = name + '=; expires=' + date.toUTCString() + '; path=/';
}
