import React, { Component } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';
import DashboardButton from '../../../generic/DashboardButton';
import Runtime from '../../../../utils/runtime';
import { DynamicServiceClient } from '../../../../api/serviceWizard';
import { LoadingSpinner } from '../../../generic/LoadingSpinner';
import NarrativeModel from '../../../../utils/NarrativeModel';

interface State {
  isLoading: boolean;
  newName: string;
  renameError: any;
  canRename: boolean;
}

export default class RenameItem extends Component<ControlMenuItemProps, State> {
  private currentName: string;

  constructor(props: ControlMenuItemProps) {
    super(props);
    this.currentName = this.props.narrative.narrative_title;
    this.state = {
      isLoading: true,
      newName: this.currentName,
      renameError: null,
      canRename: false,
    };
  }

  async componentDidMount() {
    const client = new NarrativeModel(this.props.authInfo);
    const userPerm = await client.getCurrentUserPermission(
      this.props.narrative.access_group
    );
    this.setState({
      isLoading: false,
      canRename: userPerm === 'a',
    });
  }

  validateName(event: React.ChangeEvent) {
    const value = (event.target as HTMLInputElement).value;
    this.setState({ newName: value || '' });
  }

  async doRename() {
    if (this.state.newName === this.currentName) {
      if (this.props.cancelFn) {
        this.props.cancelFn();
        return;
      }
    }
    this.setState({ isLoading: true });
    const config = Runtime.getConfig();
    const wsId = this.props.narrative.access_group;
    const objId = this.props.narrative.obj_id;
    const narrativeService = new DynamicServiceClient({
      moduleName: 'NarrativeService',
      wizardUrl: config.service_routes.service_wizard,
      authToken: this.props.authInfo.token,
      version: 'beta',
    });
    try {
      await narrativeService.call('rename_narrative', [
        {
          narrative_ref: `${wsId}/${objId}`,
          new_name: this.state.newName,
        },
      ]);
      this.props.doneFn();
      if (this.props.cancelFn) {
        this.props.cancelFn();
      }
    } catch (error) {
      this.setState({
        isLoading: false,
        renameError: error,
      });
    }
  }

  makeError(error: any) {
    return <div>An error occurred!</div>;
  }

  render() {
    let loadingSpinner = null;
    let renameControls = null;
    if (this.state.isLoading) {
      loadingSpinner = LoadingSpinner({ loading: true });
    } else if (this.state.canRename) {
      renameControls = (
        <React.Fragment>
          <div className="pb2">Enter a new name for the Narrative:</div>
          <div>
            <input
              className="w-100 pa2 mb2 br2 ba b--solid b--black-20"
              type="text"
              value={this.state.newName}
              onChange={(e) => this.validateName(e)}
            ></input>
          </div>
          <div>
            <DashboardButton
              onClick={() => this.doRename()}
              bgcolor={'lightblue'}
            >
              Ok
            </DashboardButton>
            <DashboardButton onClick={this.props.cancelFn}>
              Cancel
            </DashboardButton>
          </div>
        </React.Fragment>
      );
    } else {
      renameControls = 'You do not have permission to rename this Narrative';
    }
    let error = null;
    if (this.state.renameError) {
      error = this.makeError(this.state.renameError);
    }
    return (
      <div style={{ textAlign: 'center' }}>
        {loadingSpinner}
        {error}
        {renameControls}
      </div>
    );
  }
}
