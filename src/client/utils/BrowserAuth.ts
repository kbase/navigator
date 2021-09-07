import { getCookie } from './cookies';

/**
 * A class implementing auth interactions with the browser
 */
export class BrowserAuth {
  /**
   * Returns the current KBase auth token, if any, or null if not present.
   *
   * @returns A KBase login auth token, or null
   */
  public static getToken(): string | null {
    return getCookie('kbase_session');
  }

  public static removeToken(): string | null {
    return getCookie('kbase_session');
  }
}
