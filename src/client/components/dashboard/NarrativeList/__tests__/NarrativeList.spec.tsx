/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import { createBrowserHistory } from 'history';

import { NarrativeList } from '../';

describe('NarrativeList tests', () => {
  test('NarrativeList renders', () => {
    const wrapper = shallow(
      <NarrativeList
        category={'public'}
        history={createBrowserHistory()}
        id={1}
        limit={20}
        obj={1}
        sort={'-updated'}
        ver={1}
        view={'preview'}
      />
    );
    expect(wrapper).toBeTruthy();
    expect(wrapper.find('div')).toBeTruthy();
  });
});
