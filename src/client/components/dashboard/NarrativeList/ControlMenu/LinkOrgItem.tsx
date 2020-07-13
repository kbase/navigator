import React, { Component, CSSProperties } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';
import { LoadingSpinner } from '../../../generic/LoadingSpinner';
import Select, { Styles } from 'react-select';
import DashboardButton from '../../../generic/DashboardButton';
import { getLinkedOrgs, GroupInfo, lookupUserOrgs, GroupIdentity, linkNarrativeToOrg } from '../../../../utils/orgInfo';
import { getCurrentUserPermission } from '../../../../utils/narrativeData';
import Runtime from '../../../../utils/runtime';

/**
 * Holds the state for the overall Link Organizations item popup.
 */
interface RequestResult {
  error: boolean;
  text: string | null;
  requestSent: boolean;
}

interface State {
  isLoading: boolean;
  perm: string;
  linkedOrgs: Array<GroupInfo>;
  userOrgs: Array<GroupIdentity>;
  request: RequestResult;
}

export default class LinkOrgItem extends Component<
  ControlMenuItemProps,
  State
> {

  state = {
    isLoading: true,
    perm: 'n',
    linkedOrgs: [],
    userOrgs: [],
    request: {
      error: false,
      text: null,
      requestSent: false
    }
  }

  /**
   * Once the componenent mounts, it should look up the user's permissions
   * on the Narrative, the list of orgs that the user belongs to, and any orgs
   * that the Narrative is already linked to.
   *
   * Next, it filters the user's orgs to remove those that overlap with the orgs
   * that this Narrative is linked to - so they don't show up in the dropdown
   * selector.
   */
  async componentDidMount() {
    this.updateState();
  }

  async updateState() {
    const sharePerms = await getCurrentUserPermission(this.props.narrative.access_group);
    const linkedOrgs = await getLinkedOrgs(this.props.narrative.access_group);
    let userOrgs = await lookupUserOrgs();

    // reduce the set of userOrgs down to those that are not already linked.
    // Don't want to give the illusion of being able to link again.
    const linkedOrgIds: Set<string> = new Set();
    for (const org of linkedOrgs) {
      linkedOrgIds.add(org.id);
    }
    userOrgs = userOrgs.filter((org) => {
      return !linkedOrgIds.has(org.id);
    });

    this.setState({
      perm: sharePerms,
      linkedOrgs,
      isLoading: false,
      userOrgs
    });
  }

  async linkOrg(orgId: string): Promise<void> {
    try {
      this.setState({isLoading: true});
      const request = await linkNarrativeToOrg(this.props.narrative.access_group, orgId);
      let result: RequestResult = {
        error: false,
        text: null,
        requestSent: false
      };
      if (request.error) {
        result.error = true;
        switch(request.error.appcode) {
          case 40010:
            result.text = 'A request has already been made to add this Narrative to the group.'
            break;
          default:
            result.text = 'An error was made while processing your request.'
            break;
        }
        result.requestSent = false;
      }
      else {
        result.error = false;
        result.text = request.complete ? '' : 'A request has been sent to the group admins.';
        result.requestSent = true;
      }
      this.setState({
        isLoading: false,
        request: result
      });
      return this.updateState();
    }
    catch (error) {
      console.log(error);
    }
  }

  makeLinkedOrgsList() {
    let linkedOrgsText = 'This Narrative is not linked to any organizations.';
    let linkedOrgsList = null;
    if (this.state.linkedOrgs.length > 0) {
      linkedOrgsList = this.state.linkedOrgs.map((org: GroupInfo) => (
        <LinkedOrg
          {...org}
          key={org.id}
        />
      ));
      linkedOrgsText = 'Organizations this Narrative is linked to:';
    }
    return (
      <div className='pt2'>
        <div style={{textAlign: 'center'}}>{linkedOrgsText}</div>
        <div className='pt2'>{linkedOrgsList}</div>
      </div>
    );
  }

  render() {
    if (this.state.isLoading) {
      return (
        <div style={{ width: '35rem', textAlign: 'center' }}>
          <LoadingSpinner loading={true} />
        </div>
      );
    }
    else if (this.state.perm !== 'a') {
      return (
        <div style={{textAlign: 'center'}}>
          Only users with share access can request to add their narrative to a group.
        </div>
      )
    }
    else {
      const linkedOrgs = this.makeLinkedOrgsList();
      let message = null;
      if (this.state.request.error || this.state.request.requestSent) {
        message = (
          <div className={`pa3 mb2 ba br2 b--gold bg-light-yellow`} style={{textAlign: 'center'}}>
            {this.state.request.text}
          </div>
        )
      }
      return (
        <div style={{ width: '35rem', minHeight: '10rem' }}>
          {message}
          <OrgSelect
            linkOrg={this.linkOrg.bind(this)}
            orgs={this.state.userOrgs}
          />
          <div>{linkedOrgs}</div>
        </div>
      );
    }
  }
}

interface LinkedOrgProps extends GroupInfo {
  key: string;
}

const LinkedOrg = (props: LinkedOrgProps) => {
  console.log(props);
  return (
    <div className='pl2 pt2'>
      <a
        className='blue pointer no-underline dim'
        href={`${Runtime.getConfig().view_routes.orgs}/${props.id}`}
        target='_blank'
        >
        <span className='fa fa-external-link pr1' />
        {props.name}
      </a>
    </div>
  )
}

interface OrgListProps {
  linkOrg: (orgId: string) => void;
  orgs: Array<GroupIdentity>
}

interface OrgOption {
  value: string;
  label: string;
}

interface OrgListState {
  selectedOrgId: string;
}

class OrgSelect extends Component<OrgListProps, OrgListState> {
  private orgOptions: Array<OrgOption> = [];
  constructor(props: OrgListProps) {
    super(props);
    for (const org of props.orgs) {
      this.orgOptions.push({
        value: org.id,
        label: org.name
      });
    }
    this.state = {
      selectedOrgId: ''
    };
  }

  handleOrgChange = (selected: any) => {

    this.setState({ selectedOrgId: selected?.value || ''});
  }

  render() {
    const selectStyles: Partial<Styles> = {
      menuPortal: base => ({ ...base, zIndex: 9999 }),
    };

    return (
      <div className="flex flex-row flex-nowrap">
        <Select
          defaultOptions
          isClearable
          isSearchable
          placeholder={'Organizations you belong to...'}
          styles={{
            ...selectStyles,
            container: base => ({ ...base, flex: 2 })
          }}
          menuPortalTarget={document.body}
          className="basic-single"
          classNamePrefix="select"
          options={this.orgOptions}
          onChange={this.handleOrgChange}
          />
        <DashboardButton
          disabled={this.state.selectedOrgId.length === 0}
          onClick={() => this.props.linkOrg(this.state.selectedOrgId)}
          bgcolor={'lightblue'}>
            Link
        </DashboardButton>
      </div>
    )
  }
}
