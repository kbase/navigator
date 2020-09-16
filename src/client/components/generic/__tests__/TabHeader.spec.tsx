/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import { TabHeader } from '../TabHeader';

describe('TabHeader tests', () => {
  const tabs = Object.entries({
    one: {
      name: 'One tab',
      link: '/thatOneTab/',
    },
    two: {
      name: 'Two tab',
      link: '/thatOtherTab/',
    },
  });
  let selectTabSpy: (idx: number, name: string) => void;

  beforeEach(() => {
    selectTabSpy = jest.fn();
  });

  test('should instantiate with given tabs and second one selected', () => {
    const wrapper = shallow(<TabHeader selected={'two'} tabs={tabs} />);
    expect(wrapper.find('ul').children().length).toEqual(tabs.length);
    expect(
      wrapper
        .find('ul')
        .childAt(1)
        .find('li')
        .hasClass('active')
    ).toBeTruthy();
  });

  test('should instantiate with an optional outer class', () => {
    const wrapper = shallow(
      <TabHeader className={'some-random-class'} selected={'two'} tabs={tabs} />
    );
    expect(wrapper.find('div').hasClass('some-random-class')).toBeTruthy();
  });
});
