import React from 'react';
import { render } from 'react-dom';
import AuthWrapper from './Auth';
import App from './App';

export const Main = () => {
  return (
    <AuthWrapper>
      <App />
    </AuthWrapper>
  );
};

export function main(root: Element | null) {
  render(Main(), root);
}
