import React, { RefObject } from 'react';
import Runtime from '../utils/runtime';
import './LegacyHamburgerMenu.css';

export interface LegacyHamburgerMenuProps {}

interface LegacyHamburgerMenuState {
  isMenuOpen: boolean;
}

export class LegacyHamburgerMenu extends React.Component<
  LegacyHamburgerMenuProps,
  LegacyHamburgerMenuState
> {
  isMenuOpen: boolean = false;
  menuRef: RefObject<HTMLUListElement> = React.createRef();
  dropdownRef: RefObject<HTMLDivElement> = React.createRef();
  bodyEventListener: (ev: MouseEvent) => any;
  constructor(props: LegacyHamburgerMenuProps) {
    super(props);
    this.bodyEventListener = (ev: MouseEvent): any => {
      // Type filter to ensure we have an Element below
      if (!(ev.target instanceof Element)) {
        return;
      }
      // More type filtering since these element references can be null.
      if (this.dropdownRef.current !== null && ev.target !== null) {
        // If the click target is the menu, we do nothing, since the
        // menu has it's own handlers.
        if (
          this.dropdownRef.current === ev.target ||
          this.dropdownRef.current.contains(ev.target)
        ) {
          return;
        }
      }

      this.closeMenu();
    };
    this.state = {
      isMenuOpen: false,
    };
  }

  componentDidMount() {
    document.body.addEventListener('click', this.bodyEventListener);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.bodyEventListener);
  }

  toggleMenu() {
    this.setState((prevState: LegacyHamburgerMenuState) => {
      return { isMenuOpen: !prevState.isMenuOpen };
    });
  }

  closeMenu() {
    this.setState({ isMenuOpen: false });
  }

  onClick(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    this.toggleMenu();
    ev.stopPropagation();
  }

  renderMenu() {
    if (!this.state.isMenuOpen) {
      return;
    }

    const hostRoot = Runtime.getConfig().host_root;

    return (
      <ul className="dropdown-menu z-2" role="menu" ref={this.menuRef}>
        <li>
          <a
            href={`${hostRoot}/#narrativemanager/start`}
            onClick={this.closeMenu.bind(this)}
          >
            <span className="fa fa-file"></span>
            <span className="label">Narrative Interface</span>
          </a>
        </li>
        <li>
          <a
            href={`${hostRoot}/#narrativemanager/new`}
            onClick={this.closeMenu.bind(this)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="fa fa-plus"></span>
            <span className="label">New Narrative</span>
          </a>
        </li>
        <li>
          <a
            href={`${hostRoot}/#jgi-search`}
            onClick={this.closeMenu.bind(this)}
          >
            <span className="fa fa-search"></span>
            <span className="label">JGI Search</span>
          </a>
        </li>
        <li>
          <a
            href={`${hostRoot}/#biochem-search`}
            onClick={this.closeMenu.bind(this)}
          >
            <span className="fa fa-search"></span>
            <span className="label">Biochem Search</span>
          </a>
        </li>
        <li className="divider" />
        <li>
          <a
            href={`${hostRoot}/#about/services`}
            onClick={this.closeMenu.bind(this)}
          >
            <span className="fa fa-server"></span>
            <span className="label">KBase Services Status</span>
          </a>
        </li>
        <li className="divider" />
        <li>
          <a href={`${hostRoot}/#about`} onClick={this.closeMenu.bind(this)}>
            <span className="fa fa-info-circle"></span>
            <span className="label">About</span>
          </a>
        </li>
        <li>
          <a
            href="https://kbase.us/contact-us"
            onClick={this.closeMenu.bind(this)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="fa fa-envelope-o"></span>
            <span className="label">Contact KBase</span>
          </a>
        </li>
        <li>
          <a
            href="https://kbase.us/narrative-guide/"
            onClick={this.closeMenu.bind(this)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="fa fa-question"></span>
            <span className="label">Support</span>
          </a>
        </li>
      </ul>
    );
  }

  render() {
    return (
      <div className="Hamburger-menu" ref={this.dropdownRef}>
        <button className="Hamburger" onClick={this.onClick.bind(this)}>
          <i className="fa fa-bars icon fa-2x dib"></i>
        </button>

        {this.renderMenu()}
      </div>
    );
  }
}
