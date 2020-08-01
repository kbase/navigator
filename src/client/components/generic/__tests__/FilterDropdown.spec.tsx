/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow, render, mount } from 'enzyme';
import { FilterDropdown } from '../FilterDropdown';
import { doesNotReject } from 'assert';

const dummyEvent = {
  preventDefault: () => {},
  type: 'mousedown',
  button: 0,
};

test('Filterdropdown should expand and collapse as expected', () => {
  const dropdown = mount(
    <FilterDropdown
      onSelect={(idx: number, val: string) => {}}
      txt={'text'}
      items={['item1', 'item2']}
    />
  );
  expect(dropdown.childAt(0).children().length).toEqual(1);
  dropdown.find('a.dim.dib').simulate('click', dummyEvent);
  expect(dropdown.childAt(0).children().length).toEqual(2);
  expect(dropdown.find('div.shadow-3').children().length).toEqual(2);
  dropdown.find('a.dim.dib').simulate('click', dummyEvent);
  expect(dropdown.childAt(0).children().length).toEqual(1);
});

test('FilterDropdown should start with showing its options with the isOpen prop', () => {
  const dropdown = mount(
    <FilterDropdown
      onSelect={(idx, val) => {}}
      txt={'text'}
      items={['item1', 'item2']}
      isOpen={true}
    />
  );
  expect(dropdown.find('div.shadow-3').children().length).toEqual(2);
});

test('FilterDropdown should close on document click', () => {
  const wrapper = mount(
    <FilterDropdown
      onSelect={(idx, val) => {}}
      txt={'text'}
      items={['item1', 'item2']}
      isOpen={true}
    />
  );
  expect(wrapper.find('div.shadow-3').children().length).toEqual(2);

  /* Noting here that this kinda skirts the outside of Enzyme's simulation.
   * This click event does trigger the events set up in FilterDropdown
   * but not through Enzyme, so it doesn't change the structure that Enzyme
   * knows about, but it DOES change the rendered HTML.
   * There's probably a better way to do this, involved with rewriting how
   * that listener gets created, but I don't know what it is, and this works.
   */
  document.body.click();
  expect(wrapper.find(FilterDropdown).html()).toEqual(
    '<div class="dib relative"><a class="dim dib pa2 br2 ba b--solid b--black-20 pointer bg-white">text: item1<i class="ml1 fa fa-caret-down"></i></a></div>'
  );
});
