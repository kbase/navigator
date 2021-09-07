import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Catalog } from './catalog';
import { Dashboard } from './dashboard';
import LegacyHeader from './LegacyHeader';
import { LegacyNav } from './LegacyNav';
import { NotFoundPage } from './not_found';
import './App.css';

export function Todo(props: { text?: string }) {
  return <p>TODO {props.text}</p>;
}

export interface AppProps {}

interface AppState {}

export default class App extends React.Component<AppProps, AppState> {
  render() {
    const prefix = window._env.urlPrefix || '/';
    return (
      <div className="App">
        <div className="App-Header">
          <LegacyHeader />
        </div>

        <div className="App-Body">
          <div className="App-Sidebar">
            <LegacyNav />
          </div>

          <div className="App-Content">
            <BrowserRouter basename={prefix}>
              <Switch>
                <Route exact path={'/'} component={Dashboard} />
                <Route exact path={'/:id/:obj/:ver'} component={Dashboard} />
                <Route exact path={'/:category'} component={Dashboard} />
                <Route
                  exact
                  path={'/:category/:id/:obj/:ver'}
                  component={Dashboard}
                />
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
            </BrowserRouter>
          </div>
        </div>
      </div>
    );
  }
}
