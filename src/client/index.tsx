import React from 'react';
import { render } from 'react-dom';
import AuthWrapper from './components/Auth';
import App from './components/App';

export function main(root: Element | null) {
  render(
    <AuthWrapper>
      <App />
    </AuthWrapper>,
    root
  );
}

main(document.getElementById('react-root'));
