import React from 'react';
import { render } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('The ErrorMessage component', () => {
  test('should display a message as requested', () => {
    const component = render(<ErrorMessage message="foo" />);
    expect(component.getByText('foo')).toBeDefined();
  });
});
