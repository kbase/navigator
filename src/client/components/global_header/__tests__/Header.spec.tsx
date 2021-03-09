/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import {
  enableFetchMocks,
  FetchMock,
  MockResponseInitFunction,
} from 'jest-fetch-mock';

import { Header } from '../Header';

import * as auth from '../../../utils/auth';
import * as cookies from '../../../utils/cookies';
import Runtime from '../../../utils/runtime';

enableFetchMocks();

describe('Header tests', () => {
  it('<Header> should render', () =>
    expect(shallow(<Header title="title" />)).toBeTruthy());
});

describe('Test Sign-Out', () => {
  let tokenMock: jest.SpyInstance<string, []>;
  let purgeMock: jest.SpyInstance<void, [string]>;
  let logoutMock: FetchMock | undefined;

  const setLogoutMock = (respFunc: MockResponseInitFunction) => {
    logoutMock = fetchMock.doMockIf(
      Runtime.getConfig().service_routes.auth + '/logout',
      respFunc
    );
  };

  beforeAll(() => {
    tokenMock = jest.spyOn(auth, 'getToken').mockReturnValue('someToken');
    purgeMock = jest.spyOn(cookies, 'removeCookie');
  });

  afterEach(() => {
    purgeMock.mockClear();
    if (logoutMock) {
      logoutMock.mockRestore();
      logoutMock = undefined;
    }
  });

  afterAll(() => {
    tokenMock.mockRestore();
    purgeMock.mockRestore();
  });

  it('200 should trigger token purge', async () => {
    const header = shallow<Header>(<Header title="title" />).instance();
    setLogoutMock(async () => ({
      status: 200,
    }));

    header.signOut();
    await new Promise(setImmediate); // yield to event loop to allow pending promises to resolve
    expect(purgeMock).toBeCalledWith('kbase_session');
  });

  it('404 should not trigger token purge', async () => {
    const header = shallow<Header>(<Header title="title" />).instance();
    setLogoutMock(async () => ({
      status: 404,
    }));

    header.signOut();
    await new Promise(setImmediate);
    expect(purgeMock).not.toBeCalledWith('kbase_session');
  });

  it('Fetch failure (i.e. CORS failure) should not trigger token purge', async () => {
    const header = shallow<Header>(<Header title="title" />).instance();
    setLogoutMock(async () => {
      throw new Error('test error');
    });

    header.signOut();
    await new Promise(setImmediate);
    expect(purgeMock).not.toBeCalledWith('kbase_session');
  });
});
