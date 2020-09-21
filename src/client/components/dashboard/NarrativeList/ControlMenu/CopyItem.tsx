import React, { Component } from 'react';
// as of now eslint cannot detect when imported interfaces are used
import ControlMenuItemProps from './ControlMenuItemProps'; // eslint-disable-line no-unused-vars
import DashboardButton from '../../../generic/DashboardButton';
import Runtime from '../../../../utils/runtime';
import { DynamicServiceClient } from '../../../../api/serviceWizard';
import { LoadingSpinner } from '../../../generic/LoadingSpinner';

interface State {
  newName: string;
  makingCopy: boolean;
  copyError: any;
}

export default class CopyItem extends Component<ControlMenuItemProps, State> {
  state: State;
  constructor(props: ControlMenuItemProps) {
    super(props);
    this.state = {
      newName: this.props.narrative.narrative_title + ' - Copy',
      makingCopy: false,
      copyError: null,
    };
  }

  async makeCopy() {
    this.setState({ makingCopy: true });
    const config = Runtime.getConfig();
    const wsId = this.props.narrative.access_group;
    const objId = this.props.narrative.obj_id;
    const narrativeService = new DynamicServiceClient({
      moduleName: 'NarrativeService',
      wizardUrl: config.service_routes.service_wizard,
      authToken: Runtime.token(),
    });
    try {
      const newNarrative = await narrativeService.call('copy_narrative', [
        {
          workspaceRef: `${wsId}/${objId}`,
          workspaceId: wsId,
          newName: this.state.newName,
        },
      ]);
      console.log(newNarrative);
      this.props.doneFn();
      if (this.props.cancelFn) {
        this.props.cancelFn();
      }
    } catch (error) {
      this.setState({
        makingCopy: false,
        copyError: error,
      });
    }
  }

  validateName(event: React.ChangeEvent) {
    const value = (event.target as HTMLInputElement).value;
    this.setState({ newName: value || '' });
  }

  makeError(error: any) {
    return <div>An error occurred!</div>;
  }

  render() {
    let loadingSpinner = null;
    let copyControls = null;
    if (this.state.makingCopy) {
      loadingSpinner = LoadingSpinner({ loading: true }); // eslint-disable-line new-cap
    } else {
      copyControls = (
        <React.Fragment>
          <div className="pb2">Enter a name for the new Narrative.</div>
          <div>
            <input
              className="w-100 pa2 mb2 br2 ba b--solid b--black-20"
              type="text"
              value={this.state.newName}
              onChange={e => this.validateName(e)}
            ></input>
          </div>
          <div>
            <DashboardButton
              onClick={() => this.makeCopy()}
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
    }
    let error = null;
    if (this.state.copyError) {
      error = this.makeError(this.state.copyError);
    }
    return (
      <div style={{ textAlign: 'center' }}>
        {loadingSpinner}
        {error}
        {copyControls}
      </div>
    );
  }
}
