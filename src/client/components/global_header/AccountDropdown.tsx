import React, { Component } from 'react';
import Runtime from '../../utils/runtime';

interface State {
  dropdownHidden: boolean;
}

interface Props {
  username: string | null;
  realname: string | null;
  gravatarURL: string;
  signedout: boolean;
  onSignOut: () => void;
}

export class AccountDropdown extends Component<Props, State> {
  bodyCloseHandler: (ev: MouseEvent) => void = () => {};

  constructor(props: Props) {
    super(props);
    this.state = {
      dropdownHidden: true,
    };
  }

  componentDidMount() {
    this.bodyCloseHandler = (ev) => {
      const elm = document.querySelector('.account-dropdown');
      const target = ev.target;
      if (!elm || !target) {
        return;
      }
      if (!elm.contains(ev.target as Node)) {
        this.setState({ dropdownHidden: true });
      }
    };
    document.body.addEventListener('click', this.bodyCloseHandler);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.bodyCloseHandler);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState === this.state) {
      return;
    }
  }

  toggleDropdown() {
    this.setState((prevState) => ({
      dropdownHidden: !prevState.dropdownHidden,
    }));
  }

  // View for the account drop down when signed in
  dropdownView() {
    return (
      <div className="account-dropdown">
        <button
          className="profile-dropdown flex pointer"
          onClick={(event) => this.toggleDropdown()}
        >
          <img
            style={{ maxWidth: '40px' }}
            alt="avatar"
            src={this.props.gravatarURL}
          />
          <i
            className="fa fa-caret-down"
            style={{ marginLeft: '5px', marginTop: '14px', fontSize: '13px' }}
          ></i>
        </button>
        <ul
          className="dropdown-menu"
          role="menu"
          hidden={this.state.dropdownHidden}
        >
          <li>
            <div className="user-label">
              <div className="realname">{this.props.realname}</div>
              <div className="username">{this.props.username}</div>
            </div>
          </li>
          <li className="divider" />
          <li>
            <a href="/#people" className="menu-item">
              <div className="icon">
                <span className="fa fa-user"></span>
              </div>
              <div className="label">Your Profile</div>
            </a>
          </li>
          <li>
            <a href="/#account" className="menu-item">
              <div className="icon">
                <span className="fa fa-drivers-license"></span>
              </div>
              <div className="label">Your Account</div>
            </a>
          </li>
          <li className="divider" />
          <li>
            <a onClick={() => this.props.onSignOut()} className="menu-item">
              <div className="icon">
                <i className="fa fa-sign-out"></i>
              </div>
              <span className="label">Sign Out</span>
            </a>
          </li>
        </ul>
      </div>
    );
  }

  // View for the "Sign In" link when the user is signed out
  signInView() {
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
    return this.props.signedout ? this.signInView() : this.dropdownView();
  }
}
