import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
// as of now eslint cannot detect when imported interfaces are used
import ControlMenuItemProps from './ControlMenuItemProps'; // eslint-disable-line no-unused-vars
import Modal from '../../../generic/Modal';
import DeleteNarrative from './DeleteNarrative';
import CopyItem from './CopyItem';
import LinkOrgItem from './LinkOrgItem';
import RenameItem from './RenameItem';
import SharingItem from './sharing/SharingItem';

interface State {
  showMenu: boolean;
  showModal: boolean;
  modalItem: MenuItem | null;
}

interface MenuItem {
  title: string;
  icon: string;
  dialogTitle?: string;
  menuComponent: React.ComponentType<any>;
}

const menuItems: Array<MenuItem> = [
  {
    title: 'Manage Sharing',
    icon: 'fa fa-share-alt',
    dialogTitle: 'Manage Sharing',
    menuComponent: SharingItem,
  },
  {
    title: 'Copy this Narrative',
    icon: 'fa fa-copy',
    dialogTitle: 'Make a Copy',
    menuComponent: CopyItem,
  },
  {
    title: 'Rename',
    icon: 'fa fa-paragraph',
    dialogTitle: 'Rename Narrative',
    menuComponent: RenameItem,
  },
  {
    title: 'Link to Organization',
    icon: 'fa fa-users',
    dialogTitle: 'Link to Organization',
    menuComponent: LinkOrgItem,
  },
  {
    title: 'Delete',
    icon: 'fa fa-trash-o',
    dialogTitle: 'Delete Narrative?',
    menuComponent: DeleteNarrative,
  },
];

export default class ControlMenu extends Component<
  ControlMenuItemProps,
  State
> {
  constructor(props: ControlMenuItemProps) {
    super(props);
    this.state = {
      showMenu: false,
      showModal: false,
      modalItem: null,
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
    const menuElem = findDOMNode(this); // eslint-disable-line react/no-find-dom-node
    if (
      e.target !== menuElem &&
      !menuElem?.contains(e.target) &&
      this.state.showMenu
    ) {
      this.hideMenu();
    }
  }

  menuClicked() {
    this.setState(prevState => ({ showMenu: !prevState.showMenu }));
  }

  hideMenu() {
    this.setState({ showMenu: false });
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  menuItemClicked(item: MenuItem) {
    this.setState({
      showMenu: false,
      showModal: true,
      modalItem: item,
    });
  }

  render() {
    let menu = null;
    if (this.state.showMenu) {
      menu = (
        <div
          className="ba b--black-30 bg-white db fr absolute"
          style={{ top: '3em', right: '1em', boxShadow: '0 2px 3px #aaa' }}
        >
          {menuItems.map((item, idx) => this.menuItem(item, idx))}
        </div>
      );
    }

    let modal = null;
    if (this.state.showModal && this.state.modalItem) {
      modal = (
        <Modal
          closeFn={() => this.closeModal()}
          title={this.state.modalItem.dialogTitle}
          withCloseButton={true}
        >
          {React.createElement(this.state.modalItem.menuComponent, {
            ...this.props,
            cancelFn: () => this.closeModal(),
          })}
        </Modal>
      );
    }

    return (
      <div className="cursor tr">
        <span
          className="black-20 dim fa fa-2x fa-cog"
          style={{ cursor: 'pointer' }}
          onClick={e => this.menuClicked()}
        ></span>
        {menu}
        {modal}
      </div>
    );
  }

  menuItem(item: MenuItem, idx: number) {
    return (
      <div
        key={item.title}
        className="flex pa2 cursor hover-bg-light-gray"
        style={{ flexFlow: 'row nowrap', cursor: 'pointer' }}
        onClick={e => {
          this.menuItemClicked(item);
        }}
      >
        <span className={`${item.icon} w-10 blue`} />
        <span className="ml2">{item.title}</span>
      </div>
    );
  }
}
