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
      onSetSearch={(searchParams, invalidateCache = false) => {}}
      search={search}
      sort={'-updated'}
    />
  );

describe('The Filter component', () => {
  test('renders', () => {
    const wrapper = mockFilters();
    expect(wrapper).toBeTruthy();
    expect(wrapper.find('filters')).toBeTruthy();
  });

  test('refresh button handles click', () => {
    const wrapper = mockFilters();
    expect(wrapper.find('button.refresh').first()).toBeTruthy();
    wrapper.find('button.refresh').simulate('click', dummyEvent);
  });

  // TODO: test that sorting actually works.
  test('sort dropdown works', () => {
    const wrapper = mockFilters();
    // TODO: these selectors are fragile ... a test should try to
    // focus on one thing. There _could_ be a test to ensure that certain classes
    // are present.
    expect(wrapper.find('a.ba').first()).toBeTruthy();
    // Open the filter dropdowns:
    wrapper.find('a.ba').simulate('click', dummyEvent);
    expect(wrapper.find('a.db.hover-bg-blue').first()).toBeTruthy();
    // Click on the one with index 0:
    wrapper.find('a.db.hover-bg-blue').first().simulate('click', dummyEvent);
    expect(wrapper.find('a.ba').first()).toBeTruthy();
    // Open the filter dropdowns:
    wrapper.find('a.ba').simulate('click', dummyEvent);
    expect(wrapper.find('a.db.hover-bg-blue').at(1)).toBeTruthy();
    // Click on the one with index 1:
    wrapper.find('a.db.hover-bg-blue').at(1).simulate('click', dummyEvent);
  });

  test('search input change fires handleSearch', async () => {
    const wrapper = mockFilters();
    expect(wrapper.find('input.ba').first()).toBeTruthy();
    wrapper.find('input.ba').simulate('change', { target: { value: 'test' } });
    // This setTimeout is to simulate a pause in user's typing
    // see DEBOUNCE in SearchInput
    await new Promise<void>((resolve) =>
      window.setTimeout(() => resolve(), 500)
    );
    const wrapperVal = mockFilters('test');
    wrapperVal
      .find('input.ba')
      .simulate('change', { target: { value: 'test test' } });
    await new Promise<void>((resolve) =>
      window.setTimeout(() => resolve(), 500)
    );
  });
});
