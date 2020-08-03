import React from 'react';
import { shallow } from 'enzyme';
import DashboardButton from '../DashboardButton';

test('DashboardButton renders', () => {
  const btn = shallow(<DashboardButton>foo</DashboardButton>);
  expect(btn.text()).toEqual('foo');
  expect(btn.hasClass('pointer')).toBeTruthy();
  expect(btn.hasClass('dim')).toBeTruthy();
  expect(btn.hasClass('not-allowed')).toBeFalsy();
});

test('DashboardButton can be disabled', () => {
  const btn = shallow(<DashboardButton disabled={true}>bar</DashboardButton>);
  expect(btn.prop('style')).toHaveProperty('cursor', 'not-allowed');
});
