import Select, { OptionsType, Styles } from 'react-select';
import AsyncSelect from 'react-select/async';
import DashboardButton from '../../../../generic/DashboardButton';
import React, { Component } from 'react';
import { PERM_MAPPING } from './Definitions';
import { searchUsernames } from '../../../../../utils/auth';

/* The main user input search bar */
interface PermSearchProps {
  addPerms: (userIds: string[], perm: string) => void;
  currentUser: string; // the current user id
}

interface PermSearchState {
  inputValue: string;
  selectedUsers: string[]; // user ids
  perm: string;
}

export default class PermSearch extends Component<PermSearchProps> {
  state: PermSearchState = {
    inputValue: '',
    selectedUsers: [],
    perm: 'r',
  };
  private permOptions = [
    { value: 'r', label: PERM_MAPPING['r'] },
    { value: 'w', label: PERM_MAPPING['w'] },
    { value: 'a', label: PERM_MAPPING['a'] },
  ];

  searchUsers(
    term: string,
    callback: (options: OptionsType<any>) => void | Promise<any>
  ) {
    if (term.length < 2) {
      return new Promise(resolve => resolve(''));
    }
    console.log(this.props.currentUser);
    return searchUsernames(term).then(usernames => {
      return Object.keys(usernames)
        .filter(userId => userId !== this.props.currentUser)
        .map(userId => ({
          value: userId,
          label: `${usernames[userId]} (${userId})`,
        }))
        .sort((a, b) => a.value.localeCompare(b.value));
    });
  }

  handleInputChange = (newValue: string) => {
    const inputValue = newValue.replace(/\W/g, '');
    this.setState({ inputValue });
    return inputValue;
  };

  handleUserChange = (selected: Array<any>) => {
    if (!selected) {
      this.setState({ selectedUsers: [] });
    } else {
      const selectedUsers = selected.map(s => s.value);
      console.log(selectedUsers);
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
    const selectStyles: Partial<Styles> = {
      menuPortal: base => ({ ...base, zIndex: 9999 }),
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
            container: base => ({ ...base, flex: 2 }),
          }}
          menuPortalTarget={document.body}
          onInputChange={this.handleInputChange}
          onChange={this.handleUserChange}
        />
        <Select
          defaultValue={this.permOptions[0]}
          options={this.permOptions}
          styles={{
            ...selectStyles,
            container: base => ({ ...base, flex: 1 }),
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
