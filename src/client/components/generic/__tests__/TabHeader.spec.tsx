/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import { TabHeader } from '../TabHeader';

describe('TabHeader tests', () => {
  const tabs = ['tab1', 'tab2', 'tab3'];
  let selectTabSpy: (idx: number, name: string) => void;

  beforeEach(() => {
    selectTabSpy = jest.fn();
  });

  test('should instantiate with given tabs and second one selected', () => {
    const wrapper = shallow(
      <TabHeader selectedIdx={1} tabs={tabs} onSelectTab={selectTabSpy} />
    );
    expect(wrapper.find('ul').children().length).toEqual(tabs.length);
    expect(
      wrapper
        .find('ul')
        .childAt(1)
        .hasClass('b--green')
    ).toBeTruthy();
  });

  test('should instantiate with an optional outer class', () => {
    const wrapper = shallow(
      <TabHeader
        selectedIdx={1}
        tabs={tabs}
        onSelectTab={selectTabSpy}
        className={'some-random-class'}
      />
    );
    expect(wrapper.find('div').hasClass('some-random-class')).toBeTruthy();
  });

  test('should change tabs on click and call select fn. ', () => {
    const wrapper = shallow(
      <TabHeader
        selectedIdx={1}
        tabs={tabs}
        onSelectTab={selectTabSpy}
        className={'some-random-class'}
      />
    );
    expect(
      wrapper
        .find('ul')
        .childAt(1)
        .hasClass('b--green')
    ).toBeTruthy();
    expect(
      wrapper
        .find('ul')
        .childAt(0)
        .hasClass('b--green')
    ).toBeFalsy();
    wrapper
      .find('ul')
      .childAt(0)
      .simulate('click');
    expect(
      wrapper
        .find('ul')
        .childAt(1)
        .hasClass('b--green')
    ).toBeFalsy();
    expect(
      wrapper
        .find('ul')
        .childAt(0)
        .hasClass('b--green')
    ).toBeTruthy();
    expect(selectTabSpy).toHaveBeenCalledTimes(1);
  });
});
