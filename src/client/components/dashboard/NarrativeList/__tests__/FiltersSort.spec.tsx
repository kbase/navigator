/**
 * @jest-environment jsdom
 */
import React from 'react';
import { createBrowserHistory } from 'history';
import { render, fireEvent } from '@testing-library/react';
import { Filters } from '../Filters';
import { sorts } from '../../../../utils/searchNarratives';

const createFiltersComponent = (search: string = '') => {
  return render(
    <Filters
      category="public"
      history={createBrowserHistory()}
      loading={false}
      onSetSearch={(searchParams, invalidateCache = false) => {}}
      search={search}
      sort="-updated"
    />
  );
};

describe('The Filters Sort component', () => {
  test('renders initial state', () => {
    const { container } = createFiltersComponent();
    const sortComponent = container.querySelector('.SortDropdown');
    expect(sortComponent).not.toBeNull();
    expect(sortComponent!.textContent).toContain('Recently updated');
  });

  test('shows menu when clicked', () => {
    const expectedMenuLabels = Object.values(sorts);

    const filtersComponent = createFiltersComponent();

    // This is the top level container for the sort dropdown control.
    // Disabled, but left to demonstrate that we can be more precise,
    // but we don't really need to be.
    // To isolate the sort component, it should be a separate component
    // instead of embedded in the filters component.
    // const sortComponent = component.container.querySelector(
    //   '.SortDropdown [role="listbox"]'
    // );
    // expect(sortComponent).not.toBeNull();

    // Ensure that none of the dropdown menu items other than the first are showing.
    for (const label of expectedMenuLabels.slice(1)) {
      expect(filtersComponent.container.textContent).not.toContain(label);
    }

    // Find the dropdown button by the text appearing in it; this is the testing-library way.
    const dropdownButton = filtersComponent.getByText(expectedMenuLabels[0]);

    // Open the menu. Note that mouseDown is required; click does not do it.
    fireEvent.mouseDown(dropdownButton!);

    // Ensure that all menu item labels are displaying.
    for (const label of expectedMenuLabels) {
      expect(filtersComponent.container.textContent).toContain(label);
    }
  });
});
