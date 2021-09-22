import React from 'react';
import {
  BrowserRouter,
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { Dashboard } from './dashboard';
import LegacyHeader from './LegacyHeader';
import { LegacyNav } from './LegacyNav';
import { NotFoundPage } from './not_found';
import './App.css';
import { AuthInfo } from './Auth';
import { UserProfile } from '../utils/UserModel';

export function Todo(props: { text?: string }) {
  return <p>TODO {props.text}</p>;
}

export interface AppProps {
  authInfo: AuthInfo;
  userProfile: UserProfile;
}

interface AppState {}

export default class App extends React.Component<AppProps, AppState> {
  renderDashboard(props: RouteComponentProps) {
    return <Dashboard {...props} authInfo={this.props.authInfo} />;
  }

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
                <Route
                  exact
                  path={'/'}
                  render={this.renderDashboard.bind(this)}
                />
                <Route
                  exact
                  path={'/:id/:obj/:ver'}
                  render={this.renderDashboard.bind(this)}
                />
                <Route
                  exact
                  path={'/:category'}
                  render={this.renderDashboard.bind(this)}
                />
                <Route
                  exact
                  path={'/:category/:id/:obj/:ver'}
                  render={this.renderDashboard.bind(this)}
                />
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
