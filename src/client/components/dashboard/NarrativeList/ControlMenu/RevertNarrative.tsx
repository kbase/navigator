import React, { Component } from 'react';
import { getCurrentUserPermission } from '../../../../utils/narrativeData';
import ControlMenuItemProps from './ControlMenuItemProps';
import DashboardButton from '../../../generic/DashboardButton';
import { LoadingSpinner } from '../../../generic/LoadingSpinner';
import Runtime from '../../../../utils/runtime';
import { KBaseServiceClient } from '@kbase/narrative-utils';

type ComponentStatus =
  | 'none'
  | 'loading'
  | 'ready'
  | 'reverting'
  | 'error'
  | 'success';

interface ComponentStateBase {
  status: ComponentStatus;
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

export default class RevertNarrative extends Component<ControlMenuItemProps, ComponentState> {

    constructor(props: ControlMenuItemProps) {
        super(props);
        this.state = {
            status: 'none'
        }
    }

    async componentDidMount() {
        this.setState({
            status: 'loading'
        })
        try {
            const perm = await getCurrentUserPermission(
                this.props.narrative.access_group
            );
            if (perm === 'a') {
                this.setState({
                    status: 'ready'
                });
            } else {
                this.setState({
                    status: 'error',
                    error: {
                        message: 'You do not have permission to revert this Narrative.'
                    }
                })
            }
        } catch(e) {
            console.error(e);
        }
    }

    async doRevert() {
      const { narrative } = this.props;
      const workspaceClient = new KBaseServiceClient({
        module: 'Workspace',
        url: Runtime.getConfig().service_routes.workspace,
        authToken: Runtime.token(),
      });

      try {
        await workspaceClient.call('revert_object', [{
          wsid: narrative.access_group,
          objid: narrative.obj_id,
          ver: narrative.version
        }]);
        this.setState({status: 'success'});
      } catch(error) {
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
            this.props.doneFn(); // should redirect logic be here?
            if (this.props.cancelFn) {
            this.props.cancelFn();
            }
        };
        return (
            <div style={{ textAlign: 'center' }}>
                <p>The Narrative has been successfully reverted to version {this.props.narrative.version}.</p>
                <p>
                    It may take up to 30 seconds for this to be reflected in the display.
                </p>
                <DashboardButton onClick={done}>Close</DashboardButton>
            </div>
        );
    }

    renderConfirmation() {
        return (
          <>
            <div className="pb2">
              <p>
                Reverting a narrative to a previous version is permanent and may cause data loss.
              </p>
              <p style={{ fontWeight: 'bold' }}>This action cannot be undone!</p>
            </div>
            <div className="pb2">Continue?</div>
            <div>
              <DashboardButton
                onClick={() => this.doRevert()}
                bgcolor={'red'}
                textcolor={'white'}
              >
                Revert
              </DashboardButton>
              <DashboardButton onClick={this.props.cancelFn}>
                Cancel
              </DashboardButton>
            </div>
          </>
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