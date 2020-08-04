/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import SubTabs from '../SubTabs';

describe('SubTabs tests', () => {
  const tabs = ['tab1', 'tab2', 'tab3'];
  let selectTabSpy: (idx: number, name: string) => void;

  beforeEach(() => {
    selectTabSpy = jest.fn();
  });

  test('should instantiate with given tabs and second one selected', () => {
    const wrapper = shallow(
      <SubTabs selectedIdx={1} tabs={tabs} onSelectTab={selectTabSpy} />
    );
    expect(wrapper.find('ul').children().length).toEqual(tabs.length);
    expect(
      wrapper
        .find('ul')
        .childAt(1)
        .hasClass('green')
    ).toBeTruthy();
    expect(
      wrapper
        .find('ul')
        .childAt(0)
        .hasClass('green')
    ).toBeFalsy();
    expect(
      wrapper
        .find('ul')
        .childAt(0)
        .hasClass('pointer')
    ).toBeTruthy();
  });

  test('should change tabs on click and call select fn. ', () => {
    const wrapper = shallow(
      <SubTabs
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
        .hasClass('green')
    ).toBeTruthy();
    expect(
      wrapper
        .find('ul')
        .childAt(0)
        .hasClass('green')
    ).toBeFalsy();
    wrapper
      .find('ul')
      .childAt(0)
      .simulate('click');
    expect(
      wrapper
        .find('ul')
        .childAt(1)
        .hasClass('green')
    ).toBeFalsy();
    expect(
      wrapper
        .find('ul')
        .childAt(0)
        .hasClass('green')
    ).toBeTruthy();
    expect(selectTabSpy).toHaveBeenCalledTimes(1);
  });
});
