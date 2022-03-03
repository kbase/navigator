import React, { Component } from 'react';
import { getCurrentUserPermission } from '../../../../utils/narrativeData';
import ControlMenuItemProps from './ControlMenuItemProps';
import DashboardButton from '../../../generic/DashboardButton';
import { LoadingSpinner } from '../../../generic/LoadingSpinner';
import Runtime from '../../../../utils/runtime';
import { DynamicServiceClient } from '../../../../api/serviceWizard';
import { RouteComponentProps, withRouter } from 'react-router';
import ControlMenu from './ControlMenu';

type ComponentStatus =
  | 'none'
  | 'loading'
  | 'ready'
  | 'reverting'
  | 'error'
  | 'success';

interface ComponentStateBase {
  status: ComponentStatus;
  newVersion?: number; // the newest version returned from narrative service after successful revert
}

interface ComponentStateNone extends ComponentStateBase {
  status: 'none';
}

interface ComponentStateLoading extends ComponentStateBase {
  status: 'loading';
}

interface ComponentStateReady extends ComponentStateBase {
  status: 'ready';
}

interface ComponentStateReverting extends ComponentStateBase {
  status: 'reverting';
}

interface ComponentStateError extends ComponentStateBase {
  status: 'error';
  error: {
    message: string | Array<string>;
  };
}

interface ComponentStateSuccess extends ComponentStateBase {
  status: 'success';
}

type ComponentState =
  | ComponentStateNone
  | ComponentStateLoading
  | ComponentStateReady
  | ComponentStateReverting
  | ComponentStateError
  | ComponentStateSuccess;
class RevertNarrative extends Component<ControlMenuItemProps, ComponentState> {
  constructor(props: ControlMenuItemProps) {
    super(props);
    this.state = {
      status: 'none',
    };
  }

  async componentDidMount() {
    this.setState({
      status: 'loading',
    });
    try {
      const perm = await getCurrentUserPermission(
        this.props.narrative.access_group
      );
      if (perm === 'a') {
        this.setState({
          status: 'ready',
        });
      } else {
        this.setState({
          status: 'error',
          error: {
            message: 'You do not have permission to revert this Narrative.',
          },
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async doRevert() {
    this.setState({
      status: 'reverting',
    });

    const { narrative } = this.props;

    const narrativeClient = new DynamicServiceClient({
      moduleName: "NarrativeService",
      authToken: Runtime.token(),
      wizardUrl: Runtime.getConfig().service_routes.service_wizard,
      version: 'dev'
    })

    try {
      const revertResult = await narrativeClient.call(
        'revert_narrative_object',
        [
          {
            wsid: narrative.access_group,
            objid: narrative.obj_id,
            ver: narrative.version,
          },
        ]
      );
      this.setState({
        status: 'success',
        newVersion: revertResult[4],
      });
    } catch (error) {
      const message = (() => {
        if (error instanceof Error) {
          return error.message;
        }
        return 'Unknown error';
      })();

      this.setState({
        status: 'error',
        error: {
          message,
        },
      });
    }
  }

  renderError({ error: { message } }: ComponentStateError) {
    const messageContent = (() => {
      if (typeof message === 'string') {
        return <p>{message}</p>;
      } else {
        return message.map((message, index) => {
          return <p key={index}>{message}</p>;
        });
      }
    })();
    const done = () => {
      this.props.doneFn();
      if (this.props.cancelFn) {
        this.props.cancelFn();
      }
    };
    return (
      <>
        <div style={{ fontWeight: 'bold', color: 'red' }}>Error</div>
        {messageContent}
        <div style={{ textAlign: 'center' }}>
          <DashboardButton onClick={done}>Close</DashboardButton>
        </div>
      </>
    );
  }

  renderLoading(message: string) {
    return (
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner loading={true} />
      </div>
    );
  }

  renderSuccess() {
    const done = () => {
      this.props.doneFn();
      if (this.props.cancelFn) {
        this.props.cancelFn();
      }
      if (this.props.history) {
        const { access_group, obj_id } = this.props.narrative;
        const newUpa = `${access_group}/${obj_id}/${this.state.newVersion}`;
        const { category } = this.props;
        const queryParams = new URLSearchParams(location.search);
        const prefix = '/' + (category === 'own' ? '' : `${category}/`);
        const newLocation = `${prefix}${newUpa}?${queryParams.toString()}`;
        this.props.history.push(newLocation);
      }
    };
    return (
      <div style={{ textAlign: 'center' }}>
        <p>
          The Narrative has been successfully reverted to version{' '}
          {this.props.narrative.version}.
        </p>
        <p>
          It may take up to 30 seconds for this to be reflected in the display.
        </p>
        <DashboardButton onClick={done}>Close</DashboardButton>
      </div>
    );
  }

  renderConfirmation() {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="pb2">
          <p>
            Reverting a narrative will create a new version identical to v
            {this.props.narrative.version}.
          </p>
          <p>
            This new narrative can be reverted to an earlier version at any
            time.
          </p>
        </div>
        <div className="pb2" style={{ fontWeight: 'bold' }}>
          Do you wish to continue?
        </div>
        <div>
          <DashboardButton
            onClick={() => this.doRevert()}
            bgcolor={'lightblue'}
          >
            Revert
          </DashboardButton>
          <DashboardButton onClick={this.props.cancelFn}>
            Cancel
          </DashboardButton>
        </div>
      </div>
    );
  }

  render() {
    switch (this.state.status) {
      case 'none':
      case 'loading':
        return this.renderLoading('Loading');
      case 'ready':
        return this.renderConfirmation();
      case 'reverting':
        return this.renderLoading('Reverting Narrative');
      case 'success':
        return this.renderSuccess();
      case 'error':
        return this.renderError(this.state);
    }
  }
}

export default withRouter<ControlMenuItemProps & RouteComponentProps, any>(
  RevertNarrative
);
