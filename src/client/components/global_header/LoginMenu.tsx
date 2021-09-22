import React, { Component } from 'react';
import Runtime from '../../utils/runtime';
import { removeCookie } from '../../utils/cookies';
import { AccountDropdown } from './AccountDropdown';
import { UserProfile } from '../../utils/UserModel';
import { AuthenticationState, AuthenticationStatus } from '../Auth';

export interface LoginMenuProps {
  authState: AuthenticationState;
  title: string;
}

interface LoginMenuState {}

export class LoginMenu extends Component<LoginMenuProps, LoginMenuState> {
  constructor(props: LoginMenuProps) {
    super(props);
  }

  gravatarURL(userProfile: UserProfile) {
    const {
      profile: {
        userdata: { avatarOption, gravatarDefault },
        synced: { gravatarHash },
      },
    } = userProfile;
    if (avatarOption === 'silhouette') {
      // TODO: please explain
      let origin = Runtime.getConfig().host_root;
      if (origin !== location.origin) {
        origin = '';
      }
      return `${origin}${window._env.urlPrefix}/static/images/nouserpic.png`;
    }
    return `https://www.gravatar.com/avatar/${gravatarHash}?s=300&r=pg&d=${gravatarDefault}`;
  }

  async signOut(token: string) {
    const headers = {
      Authorization: token,
      Accept: 'application/json',
    };
    // TODO: should not be raw fetch
    try {
      const response = await fetch(
        Runtime.getConfig().service_routes.auth + '/logout',
        {
          method: 'POST',
          headers,
        }
      );

      if (response.ok) {
        // Remove the cookie
        removeCookie('kbase_session');
        // Redirect to the legacy signed-out page
        window.location.href =
          Runtime.getConfig().host_root + '/#auth2/signedout';
      } else {
        throw new Error(`${response.status}: Failed to log out`);
      }
    } catch (err) {
      console.error('Error signing out: ' + err);
    }
  }

  renderSignInView() {
    return (
      <a
        className="db no-underline br2 account-dropdown-signin"
        data-button="signin"
        href={Runtime.getConfig().host_root + '/#login'}
      >
        <div
          className="fa fa-sign-in"
          style={{ marginRight: '5px', fontSize: '25px', color: '#2196F3' }}
        ></div>
        <div style={{ color: '#666', fontSize: '13px', marginTop: '2px' }}>
          Sign In
        </div>
      </a>
    );
  }

  render() {
    const authState = this.props.authState;
    switch (authState.status) {
      case AuthenticationStatus.NONE:
      case AuthenticationStatus.UNAUTHENTICATED:
        return this.renderSignInView();
      case AuthenticationStatus.AUTHENTICATED:
        return (
          <AccountDropdown
            username={authState.userProfile.user.username}
            realname={authState.userProfile.user.realname}
            gravatarURL={this.gravatarURL(authState.userProfile)}
            onSignOut={() => {
              this.signOut(authState.authInfo.token);
            }}
          />
        );
    }
  }
}
