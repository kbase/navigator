/**
 * @jest-environment jsdom
 */

import React from 'react';
import { mount } from 'enzyme';
import { FilterDropdown } from '../FilterDropdown';

const dummyEvent = {
  preventDefault: () => {},
  type: 'mousedown',
  button: 0,
};

const dummyOtherButtonEvent = {
  preventDefault: () => {},
  type: 'mousedown',
  button: 1,
};

const items = ['item1', 'item2'];
const mockDropdown = (isOpen: boolean = false, disabled: boolean = false) =>
  mount(
    <FilterDropdown
      disabled={disabled}
      isOpen={isOpen}
      items={items}
      onSelect={(val: string) => {}}
      selectedIdx={0}
      txt={'text'}
    />
  );

test('Filterdropdown should expand and collapse as expected', () => {
  const wrapper = mockDropdown();
  expect(wrapper.childAt(0).children().length).toEqual(1);
  wrapper.find('a.dim.dib').simulate('click', dummyEvent);
  expect(wrapper.childAt(0).children().length).toEqual(2);
  expect(wrapper.find('div.shadow-3').children().length).toEqual(2);
  wrapper.find('a.dim.dib').simulate('click', dummyEvent);
  expect(wrapper.childAt(0).children().length).toEqual(1);
});

test('FilterDropdown should start with showing its options with the isOpen prop', () => {
  const wrapper = mockDropdown(true);
  expect(wrapper.find('div.shadow-3').children().length).toEqual(2);
});

test('FilterDropdown should close on document click', () => {
  const wrapper = mockDropdown(true);
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
    '<div class="dib relative">' +
      '<a class="dim dib pa2 br2 ba b--solid b--black-20 pointer bg-white">' +
      'text: item1<i class="ml1 fa fa-caret-down"></i></a></div>'
  );
});

test('FilterDropdown supports item selection', () => {
  const wrapper = mockDropdown(true);
  items.forEach((item, idx) => {
    wrapper.find('div div a').at(idx).simulate('click', dummyEvent);
    wrapper.find('div a').simulate('click', dummyEvent);
    expect(wrapper.find('div div a').at(idx).find('i').hasClass('fa-check'));
  });
});

test('FilterDropdown ignores clicks other than left-click without error', () => {
  const wrapper = mockDropdown(true);
  wrapper.find('a.dim.dib').simulate('click', dummyOtherButtonEvent);
});

test('FilterDropdown ignores clicks when disabled without error', () => {
  const wrapper = mockDropdown(true, true);
  wrapper.find('a.dim.dib').simulate('click', dummyEvent);
});

test('FilterDropdown unmounts without error', () => {
  const wrapper = mockDropdown(true);
  wrapper.unmount();
});
