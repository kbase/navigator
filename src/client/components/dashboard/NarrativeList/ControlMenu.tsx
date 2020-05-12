import React, { Component } from 'react';
import { Doc } from '../../../utils/narrativeData';
import { findDOMNode } from 'react-dom';

interface Props {
  narrative: Doc;
}

interface State {
  showMenu: boolean;
}

interface MenuItem {
  title: string;
  icon: string;
  clickFn: (narrativeInfo: Doc) => void;
}

const menuItems: Array<MenuItem> = [
  {
    title: 'Manage Sharing',
    icon: 'fa fa-share-alt',
    clickFn: testFunction,
  },
  {
    title: 'Copy this Narrative',
    icon: 'fa fa-copy',
    clickFn: testFunction,
  },
  {
    title: 'Rename',
    icon: 'fa fa-paragraph',
    clickFn: testFunction,
  },
  {
    title: 'Link to Organization',
    icon: 'fa fa-users',
    clickFn: testFunction,
  },
  {
    title: 'Delete',
    icon: 'fa fa-trash-o',
    clickFn: testFunction,
  },
];

export default class ControlMenu extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showMenu: false,
    };

    this.toggleMenu = this.toggleMenu.bind(this);
  }

  componentDidMount() {
    window.addEventListener('click', this.toggleMenu);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.toggleMenu);
  }

  toggleMenu(e: any) {
    const menuElem = findDOMNode(this);
    if (
      e.target !== menuElem &&
      !menuElem?.contains(e.target) &&
      this.state.showMenu
    ) {
      this.hideMenu();
    }
  }

  showMenu() {
    this.setState({ showMenu: true });
  }

  hideMenu() {
    this.setState({ showMenu: false });
  }

  render() {
    return (
      <div className="cursor tr">
        <span
          className="black-20 dim fa fa-2x fa-cog"
          onClick={e => this.showMenu()}
        ></span>
        {this.state.showMenu ? (
          <div
            className="ba b--black-30 bg-white db fr absolute"
            style={{ top: '3em', right: '1em' }}
          >
            {menuItems.map((item, idx) => this.menuItem(item, idx))}
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }

  menuItem(item: MenuItem, idx: number) {
    return (
      <div
        key={item.title}
        className={`flex pa2 cursor hover-bg-light-gray ${
          idx > 0 ? 'bt b--black-20' : ''
        }`}
        style={{ flexFlow: 'row nowrap' }}
        onClick={e => {
          item.clickFn(this.props.narrative);
          this.hideMenu();
        }}
      >
        <span className={`${item.icon} w-10 blue`} />
        <span className="ml2">{item.title}</span>
      </div>
    );
  }
}

function testFunction(narrativeInfo: Doc): void {
  console.log(narrativeInfo);
  alert('not implemented yet :(');
}
