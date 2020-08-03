import React from 'react';
import { shallow, render } from 'enzyme';
import { LoadingSpinner } from '../LoadingSpinner';

test('Loading spinner returns an empty element if loading is false', () => {
  const elem = shallow(<LoadingSpinner loading={false} />);
  expect(elem.html()).toBeFalsy(); // should be an empty string or null, whatever the renderer wants
});

test('Loading spinner should render correctly when loading', () => {
  const elem = shallow(<LoadingSpinner loading={true} />);
  expect(elem.find('i').hasClass('fa fa-gear fa-spin')).toBeTruthy();
});
