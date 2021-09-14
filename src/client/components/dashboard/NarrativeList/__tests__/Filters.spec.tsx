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
      category="public"
      history={createBrowserHistory()}
      loading={false}
      onSetSearch={(searchParams, invalidateCache = false) => {}}
      search={search}
      sort="-updated"
    />
  );

const mockFilters2 = (search: string = '') =>
  mount(
    <Filters
      category="public"
      history={createBrowserHistory()}
      loading={false}
      onSetSearch={(searchParams, invalidateCache = false) => {}}
      search={search}
      sort="-updated"
    />
  );

describe('The Filters component', () => {
  test('renders', () => {
    const wrapper = mockFilters();
    expect(wrapper).toBeTruthy();
    expect(wrapper.find('Filters')).toBeTruthy();
  });

  test('refresh button handles click', () => {
    const wrapper = mockFilters();
    expect(wrapper.find('button.refresh').first()).toBeTruthy();
    wrapper.find('button.refresh').simulate('click', dummyEvent);
  });

  // NOTE: See FiltersSort.spec.tsx for more complex sort control testing.
  test('sort dropdown shows default sort option', () => {
    const wrapper = mockFilters();

    // Selects the dropdown menu control wrapper
    const dropdownControl = wrapper.find('.Filters .SortDropdown > .-control');
    expect(dropdownControl).toBeTruthy();

    // This is the default selection, which appears as the controls content upon
    // first opening.
    expect(dropdownControl.text()).toEqual('Recently updated');
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
