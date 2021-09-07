import React from 'react';
import Runtime from '../../utils/runtime';

interface AccountDropdownState {
  dropdownHidden: boolean;
}

interface AccountDropdownProps {
  username: string | null;
  realname: string | null;
  gravatarURL: string;
  onSignOut: () => void;
}

export class AccountDropdown extends React.Component<
  AccountDropdownProps,
  AccountDropdownState
> {
  bodyCloseHandler: (ev: MouseEvent) => void = () => {};

  constructor(props: AccountDropdownProps) {
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
        this.closeDropdown();
      }
    };
    document.body.addEventListener('click', this.bodyCloseHandler);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.bodyCloseHandler);
  }

  toggleDropdown() {
    this.setState((prevState) => ({
      dropdownHidden: !prevState.dropdownHidden,
    }));
  }

  closeDropdown() {
    this.setState({ dropdownHidden: true });
  }

  // View for the account drop down when signed in
  render() {
    const hostRoot = Runtime.getConfig().host_root;
    return (
      <div className="account-dropdown">
        <button
          className="profile-dropdown flex pointer"
          onClick={() => this.toggleDropdown()}
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
          className="dropdown-menu z-2"
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
            <a
              href={`${hostRoot}/#people`}
              onClick={this.closeDropdown.bind(this)}
              className="menu-item"
            >
              <div className="icon">
                <span className="fa fa-user"></span>
              </div>
              <div className="label">Your Profile</div>
            </a>
          </li>
          <li>
            <a
              href={`${hostRoot}/#account`}
              onClick={this.closeDropdown.bind(this)}
              className="menu-item"
            >
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
}
