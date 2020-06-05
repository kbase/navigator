import React, { Component } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';
import DashboardButton from '../../../generic/DashboardButton';
import Runtime from '../../../../utils/runtime';
import { DynamicServiceClient } from '../../../../api/serviceWizard';

interface State {
  newName: string;
  makingCopy: boolean;
}

export default class CopyItem extends Component<ControlMenuItemProps, State> {
  state: State = {
    newName: this.props.narrative.narrative_title + ' - Copy',
    makingCopy: false,
  };

  async makeCopy() {
    this.setState({ makingCopy: true });
    console.log('copy time');
    const config = Runtime.getConfig();
    const wsId = this.props.narrative.access_group;
    const name = this.props.narrative.narrative_title;
    const narrativeService = new DynamicServiceClient({
      moduleName: 'NarrativeService',
      wizardUrl: config.service_routes.service_wizard,
      authToken: Runtime.token(),
    });
    const status = await narrativeService.call('status', []);
    console.log(status);
  }

  validateName(event: any) {
    const value = event.target.value;
    this.setState({ newName: value || '' });
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
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
      </div>
    );
  }
}
