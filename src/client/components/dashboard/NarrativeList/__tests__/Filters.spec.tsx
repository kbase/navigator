/**
 * @jest-environment jsdom
 */
import React from 'react';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import { enableFetchMocks } from 'jest-fetch-mock';
import { Filters } from '../Filters';

enableFetchMocks();

const dummyEvent = {
  preventDefault: () => {},
  type: 'mousedown',
  button: 0,
};

const mockFilters = (search: string = '') =>
  mount(
    <Filters
      category={'public'}
      history={createBrowserHistory()}
      loading={false}
      onSetSearch={searchParams => {}}
      search={search}
      sort={'-updated'}
    />
  );

describe('Filters tests', () => {
  test('Filters renders', () => {
    const wrapper = mockFilters();
    expect(wrapper).toBeTruthy();
    expect(wrapper.find('filters')).toBeTruthy();
  });

  test('Clicking refresh fires handleRefresh', () => {
    const wrapper = mockFilters();
    expect(wrapper.find('button.refresh').first()).toBeTruthy();
    // Click Refresh:
    wrapper.find('button.refresh').simulate('click', dummyEvent);
  });

  test('Clicking filter fires handleFilter', () => {
    const wrapper = mockFilters();
    expect(wrapper.find('a.ba').first()).toBeTruthy();
    // Open the filter dropdowns:
    wrapper.find('a.ba').simulate('click', dummyEvent);
    expect(wrapper.find('a.db.hover-bg-blue').first()).toBeTruthy();
    // Click on the one with index 0:
    wrapper
      .find('a.db.hover-bg-blue')
      .first()
      .simulate('click', dummyEvent);
    expect(wrapper.find('a.ba').first()).toBeTruthy();
    // Open the filter dropdowns:
    wrapper.find('a.ba').simulate('click', dummyEvent);
    expect(wrapper.find('a.db.hover-bg-blue').at(1)).toBeTruthy();
    // Click on the one with index 1:
    wrapper
      .find('a.db.hover-bg-blue')
      .at(1)
      .simulate('click', dummyEvent);
  });

  test('Changing search term fires handleSearch', async () => {
    const wrapper = mockFilters();
    expect(wrapper.find('input.ba').first()).toBeTruthy();
    wrapper.find('input.ba').simulate('change', { target: { value: 'test' } });
    // This setTimeout is to simulate a pause in user's typing
    // see DEBOUNCE in SearchInput
    await new Promise(resolve => window.setTimeout(() => resolve(), 500));
    const wrapperVal = mockFilters('test');
    wrapperVal
      .find('input.ba')
      .simulate('change', { target: { value: 'test test' } });
    await new Promise(resolve => window.setTimeout(() => resolve(), 500));
  });
});
