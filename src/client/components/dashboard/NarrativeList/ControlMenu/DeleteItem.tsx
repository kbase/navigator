import React, { Component } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';
import { LoadingSpinner } from '../../../generic/LoadingSpinner';
import DashboardButton from '../../../generic/DashboardButton';
import Runtime from '../../../../utils/runtime';
import { KBaseServiceClient } from '@kbase/narrative-utils';

interface State {
  doingDelete: boolean;
  deleteError: any;
}

export default class DeleteItem extends Component<ControlMenuItemProps, State> {
  state = {
    doingDelete: false,
    deleteError: null,
  };

  async doDelete() {
    this.setState({
      doingDelete: true,
    });
    const workspaceClient = new KBaseServiceClient({
      module: 'Workspace',
      url: Runtime.getConfig().service_routes.workspace,
      authToken: Runtime.token(),
    });
    try {
      await workspaceClient.call('delete_workspace', [
        { id: this.props.narrative.access_group },
      ]);
      this.props.doneFn();
      if (this.props.cancelFn) {
        this.props.cancelFn();
      }
    } catch (error) {
      this.props.doneFn();
      if (this.props.cancelFn) {
        this.props.cancelFn();
      }
    }
  }

  makeError(error: any) {
    console.error(error);
    return <div>An error occurred while deleting!</div>;
  }

  render() {
    let loadingSpinner = null;
    let deleteControls = null;
    if (this.state.doingDelete) {
      loadingSpinner = LoadingSpinner({ loading: true });
    } else {
      deleteControls = (
        <React.Fragment>
          <div className="pb2">
            Deleting a Narrative will permanently remove that Narrative and all
            data associated with it.
            <br />
            <b>This action cannot be undone!</b>
          </div>
          <div className="pb2">Continue?</div>
          <div>
            <DashboardButton
              onClick={() => this.doDelete()}
              bgcolor={'red'}
              textcolor={'white'}
            >
              Delete
            </DashboardButton>
            <DashboardButton onClick={this.props.cancelFn}>
              Cancel
            </DashboardButton>
          </div>
        </React.Fragment>
      );
    }
    let error = null;
    if (this.state.deleteError) {
      error = this.makeError(this.state.deleteError);
    }
    return (
      <div style={{ textAlign: 'center' }}>
        {loadingSpinner}
        {error}
        {deleteControls}
      </div>
    );
  }
}
