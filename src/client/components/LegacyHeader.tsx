import React from 'react';
import { LegacyHamburgerMenu } from './LegacyHamburgerMenu';
import { AuthContext } from './Auth';
import { AsyncProcessStatus } from '../utils/AsyncProcess';
import EnvBadge from './global_header/EnvBadge';
import { LoginMenu } from './global_header/LoginMenu';
import './LegacyHeader.css';

export interface LegacyHeaderProps {}

interface LegacyHeaderState {}

export default class LegacyHeader extends React.Component<
  LegacyHeaderProps,
  LegacyHeaderState
> {
  render() {
    return (
      <header className="LegacyHeader">
        <LegacyHamburgerMenu />

        <a href="https://kbase.us" className="dib logo-header" target="_blank">
          <img
            src={`${window._env.urlPrefix}/static/images/kbase_logo.png`}
            alt="KBase logo"
          />
        </a>

        <h1 className="roboto-header" style={{ flex: '1 1 0' }}>
          Narratives Navigator
        </h1>

        <EnvBadge />

        <AuthContext.Consumer>
          {(value) => {
            if (value.status === AsyncProcessStatus.SUCCESS) {
              return (
                <LoginMenu
                  authState={value.value}
                  title="Narratives Navigator"
                />
              );
            }
          }}
        </AuthContext.Consumer>
      </header>
    );
  }
}
