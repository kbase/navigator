/**
 * @jest-environment jsdom
 */
import React from 'react';
import { mount } from 'enzyme';
import { Main, main } from '../Main';
import { enableFetchMocks } from 'jest-fetch-mock';
import { wait } from '../../utils/testing';

enableFetchMocks();

const cookieName = 'kbase_session';

function removeAuthCookie() {
  document.cookie = `${cookieName}=; path=/; max-age=0`;
}

function setAuthCookie(value: string) {
  document.cookie = `${cookieName}=${value}; path=/`;
}

describe('The Main component', () => {
  it('should render an error if rendered with no auth token cookie', () => {
    // Ensure no auth cookie is picked up.
    removeAuthCookie();

    const wrapper = mount(<Main />);

    expect(wrapper.text()).toContain('This app requires authentication');
  });

  it('should render an error if rendered with an invalid auth token cookie', async () => {
    // Ensure no auth cookie is picked up.
    setAuthCookie('foo');
    fetchMock.mockOnce(async (req) => {
      return {
        status: 401,
        body: JSON.stringify({
          error: {
            httpcode: 401,
            httpstatus: 'Unauthorized',
            appcode: 10020,
            apperror: 'Invalid token',
            message: '10020 Invalid token',
            callid: '2253178542757350',
            time: 1630692629202,
          },
        }),
      };
    });

    const wrapper = mount(<Main />);

    await wait(100);

    expect(wrapper.text()).toContain('This app requires authentication');
  });

  // TODO: full mounting, but that requires quite a bit of mocking!

  // it('should render an error if rendered with no auth token cookie', () => {
  //   // Ensure no auth cookie is picked up.
  //   removeAuthCookie();

  //   const wrapper = mount(<Main />);

  //   // const mount = document.createElement('div');
  //   // main(mount);
  //   // TODO: something useful.
  //   expect(wrapper).toBeTruthy();

  //   expect(wrapper.text()).toContain('This app requires authentication');
  // });

  //
});

describe('The main function', () => {
  it('should render an error if rendered with no auth token cookie', () => {
    // Ensure no auth cookie is picked up.
    removeAuthCookie();

    const node = document.createElement('div');
    main(node);

    expect(node.textContent).toContain('This app requires authentication');
  });
});
