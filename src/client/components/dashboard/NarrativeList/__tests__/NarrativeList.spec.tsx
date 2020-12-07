/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import { enableFetchMocks } from 'jest-fetch-mock';
import { NarrativeList } from '../';

enableFetchMocks();

describe('NarrativeList tests', () => {
  test('NarrativeList renders', () => {
    const wrapper = shallow(
      <NarrativeList
        category={'public'}
        history={createBrowserHistory()}
        id={1}
        limit={20}
        obj={1}
        search={''}
        sort={'-updated'}
        ver={1}
        view={'preview'}
      />
    );
    expect(wrapper).toBeTruthy();
    expect(wrapper.find('div')).toBeTruthy();
  });
});
