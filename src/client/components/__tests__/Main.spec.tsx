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

    // expect(wrapper.text()).toContain('Authenticating...');

    expect(wrapper.text()).toContain('The Navigator requires authentication');
  });

  it('should render an error if rendered with an invalid auth token cookie', async () => {
    // Note that this test is only valid for developer mode (localhost); in a deployment
    // there will actually be a redirect and no error message.

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
    const main = mount(<Main />);

    // This is enough to allow the async mock to run.
    await wait(0);

    // Need to update Enzyme's view of the component; it takes a snapshot at mount time, which
    // is not correct after the call to get authentication status of the token cookie resolves.
    main.update();

    expect(main.text()).toContain('The Navigator requires authentication');
  });
});
