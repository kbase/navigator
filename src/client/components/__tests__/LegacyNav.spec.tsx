/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import { LegacyNav } from '../LegacyNav';

describe('The LegacyNav component', () => {
  it('should render an correctly', () => {
    const wrapper = shallow(<LegacyNav />);

    const labels = [
      'Navigator',
      'Orgs',
      'Catalog',
      'Search',
      'Jobs',
      'Account',
      'Feeds',
    ];

    for (const label of labels) {
      expect(wrapper.text()).toContain(label);
    }
  });
});
