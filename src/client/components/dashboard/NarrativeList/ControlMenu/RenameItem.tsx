import React, { Component } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';
import DashboardButton from '../../../generic/DashboardButton';
import Runtime from '../../../../utils/runtime';
import { DynamicServiceClient } from '../../../../api/serviceWizard';
import { LoadingSpinner } from '../../../generic/LoadingSpinner';

interface State {
  doingRename: boolean;
  newName: string;
  renameError: any;
}

export default class RenameItem extends Component<ControlMenuItemProps, State> {
  private currentName: string;

  constructor(props: ControlMenuItemProps) {
    super(props);
    this.currentName = this.props.narrative.narrative_title;
    this.state = {
      doingRename: false,
      newName: this.currentName,
      renameError: null
    };

  }

  validateName(event: React.ChangeEvent) {
    const value = (event.target as HTMLInputElement).value;
    this.setState({ newName: value || '' });
  }

  async doRename() {
    if (this.state.newName === this.currentName) {
      console.log('not doing rename!');
      if (this.props.cancelFn) {
        this.props.cancelFn();
      }
    }
    this.setState({ doingRename: true });
    const config = Runtime.getConfig();
    const wsId = this.props.narrative.access_group;
    const objId = this.props.narrative.obj_id;
    const narrativeService = new DynamicServiceClient({
      moduleName: 'NarrativeService',
      wizardUrl: config.service_routes.service_wizard,
      authToken: Runtime.token(),
    });
    try {
      const updatedUpa = await narrativeService.call('rename_narrative', [
        {
          narrativeRef: `${wsId}/${objId}`,
          newName: this.state.newName,
        },
      ]);
      console.log(updatedUpa);
      this.props.doneFn();
      if (this.props.cancelFn) {
        this.props.cancelFn();
      }
    } catch (error) {
      this.setState({
        doingRename: false,
        renameError: error,
      });
    }
  }

  makeError(error: any) {
    return <div>An error occurred!</div>;
  }

  render() {
    let loadingSpinner = null;
    let copyControls = null;
    if (this.state.doingRename) {
      loadingSpinner = LoadingSpinner({ loading: true });
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
    }
    let error = null;
    if (this.state.renameError) {
      error = this.makeError(this.state.renameError);
    }
    return (
      <div style={{ textAlign: 'center' }}>
        {loadingSpinner}
        {error}
        {copyControls}
      </div>
    );
  }}
