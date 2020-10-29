import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { Catalog } from './components/catalog';
import { Dashboard } from './components/dashboard';
// Global navigation (legacy copy of previous kbase-ui)
import { Header } from '../client/components/global_header/Header';
import { NotFoundPage } from './components/not_found';
import { Unauthorized } from '../client/components/unauthorized_page/UnauthorizedPage';

// Utils
import { getUsername, getToken } from './utils/auth';
import { createBrowserHistory } from 'history';

// Top-level URL history object
const history = createBrowserHistory();
const CONTAINER = document.getElementById('react-root');

// Change the style of the current item in the top-nav.
// For new nav:
document.querySelectorAll('[data-hl-nav]').forEach((node: Element) => {
  // Highlight the dashboard for the root path
  const path = history.location.pathname;
  if (path.match(new RegExp('^' + node.getAttribute('data-hl-nav')))) {
    node.className =
      'dib ph3 pv2 no-underline black-80 w-100 dim b bg-light-gray br bw2 b--green';
  }
});
// Highlight dashboard for root path
// For legacy nav:
document.querySelectorAll('[data-hl-legacy-nav]').forEach(node => {
  const path = history.location.pathname;
  if (path === node.getAttribute('data-hl-legacy-nav')) {
    node.classList.add('active');
  }
});

// Set the signed-in username in the global env
getUsername((username: string | null) => {
  if (username) {
    window._env.username = username;
  }
});

// Global header (legacy design)
const headerElem = document.querySelector('#react-global-header');
if (headerElem) {
  let pageTitle = '';
  if (getToken()) {
    pageTitle = headerElem.getAttribute('data-page-title') || '';
  }
  render(<Header title={pageTitle || ''} />, headerElem);
}

const prefix = window._env.urlPrefix || '/';

// Top level page component
export const Page: React.FC = () => (
  <div className="ph4 bg-light-gray">
    <Router basename={prefix}>
      <Switch>
        <Route exact path={'/'} component={Dashboard} />
        <Route exact path={'/:id/:obj/:ver'} component={Dashboard} />
        <Route exact path={'/:category'} component={Dashboard} />
        <Route exact path={'/:category/:id/:obj/:ver'} component={Dashboard} />
        <Route path="/search">
          <Todo text="Search" />
        </Route>
        <Route path="/orgs">
          <Todo text="Orgs" />
        </Route>
        <Route path="/catalog" component={Catalog} />
        <Route path="/notifications">
          <Todo text="Notifications" />
        </Route>
        <Route path="/account">
          <Todo text="Account" />
        </Route>
        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
    </Router>
  </div>
);

// Placeholder component for pages we have not implemented yet
export function Todo(props: { text?: string }) {
  return <p>TODO {props.text}</p>;
}

// Render the top level page component
if (CONTAINER) {
  if (!getToken()) {
    render(<Unauthorized />, CONTAINER);
    // Hide the legacy side nav, if present
    const sidenav = document.querySelector('.legacy-nav');
    if (sidenav) {
      (sidenav as HTMLElement).style.display = 'none';
    }
  } else {
    render(<Page />, CONTAINER);
  }
}
