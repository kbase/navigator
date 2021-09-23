import React from 'react';
import { render } from '@testing-library/react';
import NotFoundPage from '../NotFoundPage';

describe('The NotFoundPage component', () => {
  test('should display default text with no props passed in', () => {
    const component = render(<NotFoundPage />);
    expect(component.getByText('Page Not Found')).toBeDefined();
    expect(component.getByText('Return home')).toBeDefined();
  });

  test('should display text passed in via props ', () => {
    const component = render(<NotFoundPage linkText="Go Somewhere" />);
    expect(component.getByText('Page Not Found')).toBeDefined();
    expect(component.getByText('Go Somewhere')).toBeDefined();
  });
});
