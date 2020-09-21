import React, { Component } from 'react';
// as of now eslint cannot detect when imported interfaces are used
import ControlMenuItemProps from './ControlMenuItemProps'; // eslint-disable-line no-unused-vars
import { LoadingSpinner } from '../../../generic/LoadingSpinner';
import DashboardButton from '../../../generic/DashboardButton';
import Runtime from '../../../../utils/runtime';
import { KBaseServiceClient } from '@kbase/narrative-utils';
import { getCurrentUserPermission } from '../../../../utils/narrativeData';

interface State {
  isLoading: boolean;
  deleteError: any;
  canDelete: boolean;
}

export default class DeleteItem extends Component<ControlMenuItemProps, State> {
  state = {
    isLoading: true,
    deleteError: null,
    canDelete: false,
  };

  async componentDidMount() {
    const perm = await getCurrentUserPermission(
      this.props.narrative.access_group
    );
    this.setState({
      isLoading: false,
      canDelete: perm === 'a',
    });
  }

  async doDelete() {
    this.setState({
      isLoading: true,
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
    if (this.state.isLoading) {
      loadingSpinner = LoadingSpinner({ loading: true }); // eslint-disable-line new-cap
    } else if (this.state.canDelete) {
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
    } else {
      deleteControls = 'You do not have permission to delete this Narrative.';
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
