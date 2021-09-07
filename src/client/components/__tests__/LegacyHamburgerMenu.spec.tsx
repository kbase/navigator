/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { LegacyHamburgerMenu } from '../LegacyHamburgerMenu';

import { wait } from '../../utils/testing';

describe('The LegacyHamburgerMenu component', () => {
  test('should not render menu initially', async () => {
    const wrapper = shallow(<LegacyHamburgerMenu />);

    const menuLabels = [
      'New Narrative',
      'JGI Search',
      'Biochem Search',
      'KBase Services Status',
      'About',
    ];

    for (const label of menuLabels) {
      expect(wrapper.text()).not.toContain(label);
    }
  });

  test('should render menu after clicking hamburger button', async () => {
    const wrapper = mount(<LegacyHamburgerMenu />);

    wrapper.find('.Hamburger').simulate('click');

    const menuLabels = [
      'New Narrative',
      'JGI Search',
      'Biochem Search',
      'KBase Services Status',
      'About',
    ];

    for (const label of menuLabels) {
      expect(wrapper.text()).toContain(label);
    }
  });

  test('should show the menu after one click and remove it after a second', async () => {
    const wrapper = mount(<LegacyHamburgerMenu />);

    wrapper.find('.Hamburger').simulate('click');

    const menuLabels = [
      'New Narrative',
      'JGI Search',
      'Biochem Search',
      'KBase Services Status',
      'About',
    ];

    for (const label of menuLabels) {
      expect(wrapper.text()).toContain(label);
    }

    wrapper.find('.Hamburger').simulate('click');

    for (const label of menuLabels) {
      expect(wrapper.text()).not.toContain(label);
    }
  });
});
