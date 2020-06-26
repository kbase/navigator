import React, { Component, CSSProperties } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';
import { LoadingSpinner } from '../../../generic/LoadingSpinner';
import { KBaseServiceClient } from '@kbase/narrative-utils';
import Runtime from '../../../../utils/runtime';
import { getUsernames, searchUsernames } from '../../../../utils/auth';
import Select, { OptionsType } from 'react-select';
import AsyncSelect from 'react-select/async';
import DashboardButton from '../../../generic/DashboardButton';

interface State {
  isLoading: boolean;
  perms: NarrativePerms;
}

interface UserPerms {
  userId: string;
  userName: string;
  perm: string;
}

interface NarrativePerms {
  allUserPerms: Array<UserPerms>;
  curUserPerm: UserPerms;
  isGlobal: boolean;
}

const PERM_MAPPING: { [key: string]: string } = {
  a: 'can view, edit, and share',
  w: 'can view and edit',
  r: 'can view',
  n: 'None',
};

export default class SharingItem extends Component<
  ControlMenuItemProps,
  State
> {
  private workspaceClient: KBaseServiceClient;

  constructor(props: ControlMenuItemProps) {
    super(props);

    this.workspaceClient = new KBaseServiceClient({
      module: 'Workspace',
      url: Runtime.getConfig().service_routes.workspace,
      authToken: Runtime.token(),
    });

    const userId = Runtime.username() || '';

    this.state = {
      isLoading: true,
      perms: {
        allUserPerms: [],
        isGlobal: false,
        curUserPerm: {
          userId,
          userName: '',
          perm: 'n',
        },
      },
    };
  }

  componentDidMount() {
    this.updateSharedUserInfo();
  }

  async updateSharedUserInfo() {
    let sharedUserInfo: NarrativePerms = await this.fetchSharedUsers();
    this.setState({
      isLoading: false,
      perms: sharedUserInfo,
    });
  }

  async fetchSharedUsers(): Promise<NarrativePerms> {
    const wsId = this.props.narrative.access_group;
    // get shared perms from workspace
    let perms = await this.workspaceClient.call('get_permissions_mass', [
      { workspaces: [{ id: wsId }] },
    ]);
    perms = perms.perms[0];
    const isGlobal = '*' in perms && perms['*'] != 'n';
    const narrativePerms: NarrativePerms = {
      isGlobal: isGlobal,
      allUserPerms: [],
      curUserPerm: this.state.perms.curUserPerm,
    };
    const userList = Object.keys(perms).reduce((users, userId): string[] => {
      if (userId !== '*') {
        users.push(userId);
      }
      return users;
    }, [] as string[]);
    // get user infos from auth
    const userNames: { [key: string]: string } = await getUsernames(userList);
    userList.forEach(u => {
      const userPerm: UserPerms = {
        userId: u,
        userName: userNames[u],
        perm: perms[u],
      };
      if (u === narrativePerms.curUserPerm.userId) {
        narrativePerms.curUserPerm = userPerm;
      } else {
        narrativePerms.allUserPerms.push(userPerm);
      }
    });
    narrativePerms.allUserPerms = narrativePerms.allUserPerms.sort((a, b) => {
      return a.userName.localeCompare(b.userName);
    });
    return narrativePerms;
  }

  togglePublic() {
    this.setState({ isLoading: true });
    const isGlobal = this.state.perms.isGlobal;
    this.workspaceClient
      .call('set_global_permission', [
        {
          id: this.props.narrative.access_group,
          new_permission: isGlobal ? 'n' : 'r',
        },
      ])
      .then(() => {
        this.setState(prevState => ({
          isLoading: false,
          perms: {
            isGlobal: !isGlobal,
            allUserPerms: prevState.perms.allUserPerms,
            curUserPerm: prevState.perms.curUserPerm,
          },
        }));
      })
      .catch(err => {
        console.error(err);
      });
  }

  updatePerms(userIds: string[], newPerm: string) {
    this.setState({ isLoading: true });
    this.workspaceClient
      .call('set_permissions', [
        {
          id: this.props.narrative.access_group,
          users: userIds,
          new_permission: newPerm,
        },
      ])
      .then(() => {
        this.updateSharedUserInfo();
      })
      .catch(err => console.error(err));
  }

  searchUsers(
    term: string,
    callback: (options: OptionsType<any>) => void | Promise<any>
  ) {
    if (term.length < 2) {
      return new Promise(resolve => resolve(''));
    }
    return searchUsernames(term).then(usernames => {
      return (
        Object.keys(usernames)
          // .filter(userId => userId !== this.state.perms.curUserPerm.userId)
          .map(userId => ({
            value: userId,
            label: `${usernames[userId]} (${userId})`,
          }))
          .sort((a, b) => a.value.localeCompare(b.value))
      );
    });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner loading={true} />
        </div>
      );
    }

    let sharedUsers = null;
    if (this.state.perms.allUserPerms) {
      sharedUsers = this.state.perms.allUserPerms.map((p: UserPerms) => (
        <ShareUser
          {...p}
          key={p.userId}
          updatePerms={this.updatePerms.bind(this)}
        />
      ));
    }

    return (
      <div style={{ width: '30rem', minHeight: '10rem' }}>
        <GlobalPerms
          isGlobal={this.state.perms.isGlobal}
          isAdmin={this.state.perms.curUserPerm.perm === 'a'}
          togglePublic={() => this.togglePublic()}
        />
        <PermSearch
          addPerms={this.updatePerms.bind(this)}
          searchUsers={this.searchUsers}
        />
        <div>{sharedUsers}</div>
      </div>
    );
  }
}

interface GlobalProps {
  isGlobal: boolean;
  isAdmin: boolean;
  togglePublic: () => void;
}

function GlobalPerms(props: GlobalProps): React.ReactElement {
  const globalStyle: CSSProperties = {
    // backgroundColor: props.isGlobal ? 'lightgreen' : 'lightblue',
    // color: props.isGlobal ? 'green' : 'blue',
    textAlign: 'center',
  };
  const icon = props.isGlobal ? 'fa-unlock' : 'fa-lock';

  let className = 'pa2 mb2 br2';
  if (props.isAdmin) {
    className += ' dim pointer';
  }

  let text = '';
  if (props.isGlobal) {
    text = 'Public';
    className += ' bg-light-green dark-green';
    if (props.isAdmin) {
      text += ' (click to lock)';
    }
  } else {
    text = 'Private';
    className += ' bg-lightest-blue dark-blue';
    if (props.isAdmin) {
      text += ' (click to unlock)';
    }
  }

  return (
    <div
      className={className}
      style={globalStyle}
      {...(props.isAdmin && { onClick: props.togglePublic })}
    >
      <span className={`fa ${icon} pr2`} />
      {text}
    </div>
  );
}

/* The individual user that has some sharing permissions */
interface ShareUserProps extends UserPerms {
  updatePerms: (userIds: string[], newPerm: string) => void;
  key: string;
}

function ShareUser(props: ShareUserProps): React.ReactElement {
  return (
    <div
      className={'flex flex-row flex-nowrap pt1'}
      style={{ justifyContent: 'space-between' }}
    >
      <div className="pa2">
        {props.userName} ({props.userId})
      </div>
      <div className={'flex flex-row flex-nowrap'}>
        <PermDropdown
          key={props.userId}
          curPerm={props.perm}
          userId={props.userId}
          updatePerms={props.updatePerms}
        />
        <div
          className="pa2 ml1 fa fa-times dim pointer white bg-red br2"
          style={{ alignSelf: 'center' }}
          onClick={() => props.updatePerms([props.userId], 'n')}
        />
      </div>
    </div>
  );
}

/* The little dropdown that each user has */
interface PermDropdownProps {
  curPerm: string; // one of 'n', 'r', 'w', 'a' - text comes from PERM_MAPPING
  updatePerms: (userIds: string[], newPerm: string) => void;
  userId: string;
  key: string;
}

function PermDropdown(props: PermDropdownProps): React.ReactElement {
  let options = ['r', 'w', 'a'].map(o => (
    <option key={o} value={o}>
      {PERM_MAPPING[o]}
    </option>
  ));

  return (
    <select
      dir="rtl"
      className="br2 b--black-20 pa1"
      defaultValue={props.curPerm}
      onChange={e => props.updatePerms([props.userId], e.currentTarget.value)}
    >
      {options}
    </select>
  );
}

/* The main user input search bar */
interface PermSearchProps {
  addPerms: (userIds: string[], perm: string) => void;
  searchUsers: (
    inputValue: string,
    callback: (options: OptionsType<any>) => void | Promise<any>
  ) => void;
}

interface PermSearchState {
  inputValue: string;
  selectedUsers: string[]; // user ids
  perm: string;
}

class PermSearch extends Component<PermSearchProps> {
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

  handleInputChange = (newValue: string) => {
    const inputValue = newValue.replace(/\W/g, '');
    this.setState({ inputValue });
    return inputValue;
  };

  handleUserChange = (selected: Array<any>) => {
    console.log(selected);
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
    return (
      <div>
        {/* // className="flex flex-row flex-nowrap"> */}
        <AsyncSelect
          isMulti
          cacheOptions
          defaultOptions
          loadOptions={this.props.searchUsers}
          placeholder={'Share with...'}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          menuPortalTarget={document.body}
          onInputChange={this.handleInputChange}
          onChange={this.handleUserChange}
        />
        <Select
          defaultValue={this.permOptions[0]}
          options={this.permOptions}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          menuPortalTarget={document.body}
          onChange={this.handlePermChange}
        />
        <DashboardButton
          disabled={this.state.selectedUsers.length === 0}
          onClick={this.updatePerms}
          bgcolor={'lightblue'}
        >
          Apply
        </DashboardButton>
      </div>
    );
  }
}
