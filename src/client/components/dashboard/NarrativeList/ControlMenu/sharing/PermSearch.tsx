import Select, { OptionsType, Styles } from 'react-select';
import AsyncSelect from 'react-select/async';
import DashboardButton from '../../../../generic/DashboardButton';
import React, { Component } from 'react';
import { PERM_MAPPING } from './Definitions';
import { AuthInfo } from '../../../../Auth';
import { AuthService } from '../../../../../utils/AuthService';

/* The main user input search bar */
interface PermSearchProps {
  authInfo: AuthInfo;
  addPerms: (userIds: string[], perm: string) => void;
  currentUser: string; // the current user id
}

interface PermSearchState {
  selectedUsers: string[]; // user ids
  perm: string;
}

export interface PermOption {
  value: string;
  label: string;
}

export default class PermSearch extends Component<PermSearchProps> {
  state: PermSearchState = {
    selectedUsers: [],
    perm: 'r',
  };
  private permOptions: Array<PermOption> = [
    { value: 'r', label: PERM_MAPPING['r'] },
    { value: 'w', label: PERM_MAPPING['w'] },
    { value: 'a', label: PERM_MAPPING['a'] },
  ];

  searchUsers(
    term: string,
    _callback: (options: OptionsType<any>) => void | Promise<any>
  ) {
    if (term.length < 2) {
      return new Promise((resolve) => resolve(''));
    }
    const auth = new AuthService(this.props.authInfo.token);
    return auth.searchUsernames(term).then((usernames) => {
      return Object.keys(usernames)
        .filter((userId) => userId !== this.props.currentUser)
        .map((userId) => ({
          value: userId,
          label: `${usernames[userId]} (${userId})`,
        }))
        .sort((a, b) => a.value.localeCompare(b.value));
    });
  }

  handleUserChange = (selected: Array<any>) => {
    if (!selected) {
      this.setState({ selectedUsers: [] });
    } else {
      const selectedUsers = selected.map((s) => s.value);
      this.setState({ selectedUsers });
    }
  };

  handlePermChange = (selected: any) => {
    this.setState({ perm: selected.value });
  };

  updatePerms = () => {
    this.props.addPerms(this.state.selectedUsers, this.state.perm);
  };

  render() {
    const selectStyles: Partial<Styles<PermOption, false>> = {
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };
    return (
      <div className="flex flex-row flex-nowrap">
        <AsyncSelect
          isMulti
          cacheOptions
          defaultOptions
          loadOptions={this.searchUsers.bind(this)}
          placeholder={'Share with...'}
          styles={{
            ...selectStyles,
            container: (base: any) => ({ ...base, flex: 2 }),
          }}
          menuPortalTarget={document.body}
          onChange={this.handleUserChange.bind(this)}
        />
        <Select
          defaultValue={this.permOptions[0]}
          options={this.permOptions}
          styles={{
            ...selectStyles,
            container: (base) => ({ ...base, flex: 1 }),
          }}
          menuPortalTarget={document.body}
          onChange={this.handlePermChange}
        />
        <div style={{ flexShrink: 1 }}>
          <DashboardButton
            disabled={this.state.selectedUsers.length === 0}
            onClick={this.updatePerms}
            bgcolor={'lightblue'}
          >
            Apply
          </DashboardButton>
        </div>
      </div>
    );
  }
}
