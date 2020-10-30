/**
 * @jest-environment jsdom
 */

import { shallow } from 'enzyme';
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import { Dashboard } from '../';

describe('Dashboard component', () => {
  test('renders', async () => {
    const wrapper = shallow(
      <Router>
        <Route exact component={Dashboard} />
      </Router>
    );
    await expect(wrapper).toBeTruthy();
    expect(wrapper.html().length).toBeGreaterThan(0);
  });
});
