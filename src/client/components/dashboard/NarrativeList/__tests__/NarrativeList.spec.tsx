/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import { enableFetchMocks } from 'jest-fetch-mock';
import { NarrativeList } from '../';

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
  test('renders default view', () => {
    const wrapper = shallow(
      <NarrativeList
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
    expect(wrapper).toBeTruthy();
    expect(wrapper.find('div')).toBeTruthy();
  });
});
