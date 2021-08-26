import React from 'react';
import { shallow } from 'enzyme';
import { LoadingSpinner } from '../LoadingSpinner';

describe('The LoadingSpinner component', () => {
  test('should create an empty element if loading is false', () => {
    const elem = shallow(<LoadingSpinner loading={false} />);
    expect(elem.html()).toEqual('');
  });

  test('should render the spinner icon when loading', () => {
    const elem = shallow(<LoadingSpinner loading={true} />);
    expect(elem.exists('.fa.fa-gear.fa-spin')).toBeTruthy();
  });

  test('should render the default message when loading', () => {
    const elem = shallow(<LoadingSpinner loading={true} />);
    expect(elem.text()).toContain('Loading');
  });

  test('should render the custom message when loading', () => {
    const elem = shallow(<LoadingSpinner loading={true} message="Foo bar" />);
    expect(elem.text()).toContain('Foo bar');
  });
});
