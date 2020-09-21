/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import SubTabs from '../SubTabs';

describe('SubTabs tests', () => {
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

  test('should instantiate with given tabs and second one selected', () => {
    const wrapper = shallow(<SubTabs selected={'two'} tabs={tabs} />);
    expect(wrapper.find('ul').children().length).toEqual(tabs.length);
    expect(
      wrapper
        .find('ul')
        .childAt(1)
        .find('li')
        .hasClass('active')
    ).toBeTruthy();
  });
});
