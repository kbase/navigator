/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import { enableFetchMocks } from 'jest-fetch-mock';
import { NarrativeList } from '../';
import { AuthInfo } from '../../../Auth';

enableFetchMocks();

describe('The NarrativeList component', () => {
  // TODO: this tests actually that NarrativeList renders without error
  // if there is no token. In that case it renders an empty list.
  // IMO this app should either render the results of anonymous searchs
  // or an error.
  //
  // Even better would to simply render what it is given, and have a
  // data component wrapping it to provide the actual search functionality,
  // which would not only separate the concerns, but also make it more testable.
  //
  // Also providing an id (ws?), obj, and ver when that narrative is not present
  // should probably trigger an error message.
  //
  // The preview view should also not be valid (nor should the detail pane care),
  // if there are no items.
  //
  // Arguably this is the most important test in the repo, as it can exercise the
  // top level ui behavior under various data conditions.

  // DISABLED - this will never work unless there are mocks for all the calls that
  // NarrativeList and sub-components will invoke.
  test.skip('renders default view', () => {
    console.error('*** in da test');
    expect(true).toBeTruthy();
    const authInfo: AuthInfo = {
      token: 'foo',
      tokenInfo: {
        cachefor: 0,
        created: 0,
        expires: 0,
        id: 'foo',
        name: 'foo',
        type: 'login',
        custom: {},
        user: 'foo',
      },
    };
    const wrapper = shallow(
      <NarrativeList
        authInfo={authInfo}
        category="own"
        history={createBrowserHistory()}
        id={1}
        limit={20}
        obj={1}
        search=""
        sort="-updated"
        ver={1}
        view="preview"
      />
    );
    // expect(wrapper).toBeTruthy();
    // expect(wrapper.find('div')).toBeTruthy();
  });
});
