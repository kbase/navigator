/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';

import { NotFoundPage } from '../index';

describe('Preview tests', () => {
  it('<NotFound> should render with no props', () => {
    const component = shallow(<NotFoundPage />);
    expect(component.find('h1').text()).toEqual('Page Not Found');
    expect(component.find('a').text()).toEqual('Return home');
  });

  it('<NotFound> should render with a custom link label and url', () => {
    const component = shallow(<NotFoundPage href="foo" linkText="bar" />);
    expect(component.find('a').text()).toEqual('bar');
    expect(component.find('a').prop('href')).toEqual('foo');
  });
});
