/**
 * @jest-environment jsdom
 */

// as of now eslint cannot detect when imported interfaces are used
import { Location } from 'history'; // eslint-disable-line no-unused-vars

import { keepParamsLinkTo, keepSort } from '../utils';

const mocks = (
  pathname: string = 'path',
  search: string = '?keepThisParam=1729&andThis=Ramanujan'
) => {
  const mockHistoryLocation: Location = {
    hash: '',
    pathname: pathname,
    search: search,
    state: {},
  };
  return { mockHistoryLocation };
};

describe('Dashboard utils tests', () => {
  test('keepParmasLinkTo preserves listed parameters', () => {
    const { mockHistoryLocation } = mocks();
    const testKeep = keepParamsLinkTo(
      ['keepThisParam', 'andThis', 'andThat'],
      '/elsewhere?withThisParam=true'
    );
    const link = testKeep(mockHistoryLocation);
    expect(link).toBe(
      '/elsewhere?withThisParam=true&keepThisParam=1729&andThis=Ramanujan'
    );
  });
  test('keepParmasLinkTo forgets unlisted parameters', () => {
    const { mockHistoryLocation } = mocks();
    const testKeep = keepParamsLinkTo(
      ['keepThisParam'],
      '/elsewhere?withThisParam=true'
    );
    const link = testKeep(mockHistoryLocation);
    expect(link).toBe('/elsewhere?withThisParam=true&keepThisParam=1729');
  });
  test('keepParmasLinkTo treats queries and anchors properly (/path)', () => {
    const { mockHistoryLocation } = mocks();
    const testKeep = keepParamsLinkTo(
      ['keepThisParam', 'andThis', 'andThat'],
      '?withThisParam=true'
    );
    const link = testKeep(mockHistoryLocation);
    expect(link).toBe(
      '/path?withThisParam=true&keepThisParam=1729&andThis=Ramanujan'
    );
  });
  test('keepParmasLinkTo treats relative links properly (/path)', () => {
    const { mockHistoryLocation } = mocks();
    const testKeep = keepParamsLinkTo(
      ['keepThisParam', 'andThis', 'andThat'],
      'elsewhere?withThisParam=true'
    );
    const link = testKeep(mockHistoryLocation);
    expect(link).toBe(
      '/elsewhere?withThisParam=true&keepThisParam=1729&andThis=Ramanujan'
    );
  });
  test('keepParmasLinkTo treats relative links properly (/path/)', () => {
    const { mockHistoryLocation } = mocks('/path/');
    const testKeep = keepParamsLinkTo(
      ['keepThisParam', 'andThis', 'andThat'],
      'elsewhere?withThisParam=true'
    );
    const link = testKeep(mockHistoryLocation);
    expect(link).toBe(
      '/path/elsewhere?withThisParam=true&keepThisParam=1729&andThis=Ramanujan'
    );
  });
  test('keepSort keeps the sort parameter', () => {
    const { mockHistoryLocation } = mocks('/path/', '?sort=up&notThis=false');
    const link = keepSort('/')(mockHistoryLocation);
    expect(link).toBe('/?sort=up');
  });
});
