import React from 'react';
import { render } from '@testing-library/react';
import Loading from '../generic/Loading';

describe('The Loading component', () => {
  test('should display a loading message as requested', () => {
    const component = render(<Loading message="foo" />);
    expect(component.getByText('foo')).toBeDefined();
  });

  test('should display the default loading message when one is not provided', () => {
    const component = render(<Loading />);
    expect(component.getByText('Loading...')).toBeDefined();
  });
});
