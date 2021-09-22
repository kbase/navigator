import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { History } from 'history';

import { sorts } from '../../utils/searchNarratives';

// Components
import { NarrativeList } from './NarrativeList';
import { AuthContext, AuthenticationStatus } from '../Auth';
import { AsyncProcessStatus } from '../../utils/AsyncProcess';
import { LoadingSpinner } from '../generic/LoadingSpinner';
import Runtime from '../../utils/runtime';

interface RouteParams {
  category?: string;
  id?: string;
  obj?: string;
  ver?: string;
}

interface Props extends RouteComponentProps<RouteParams> {
  history: History;
}

interface State {
  loading: boolean;
}

const sortSlugDefault = Object.keys(sorts)[0];

// Parent page component for the dashboard page
export class Dashboard extends Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.setState({ loading: false });
  }

  renderUnauthenticated() {
    // If running on a kbase.us host, we route to kbase-ui login.
    if (/kbase\.us$/.test(document.location.host)) {
      document.location.href = Runtime.getConfig().host_root + '/#login';
    } else {
      return this.renderError('This app requires authentication');
    }
  }

  renderLoading() {
    return (
      <div
        className="Alert Alert-info"
        style={{ marginTop: '4em', maxWidth: '30em', alignSelf: 'center' }}
      >
        <LoadingSpinner loading={true} message={'Loading ...'} />
      </div>
    );
  }

  renderError(message: string) {
    return (
      <div
        className="Alert Alert-danger"
        style={{ marginTop: '4em', maxWidth: '30em', alignSelf: 'center' }}
      >
        <div style={{ fontWeight: 'bold' }}>Error</div>
        <p>{message}</p>
      </div>
    );
  }

  render() {
    const { id, obj, ver } = this.props.match.params;
    const category = this.props.match.params.category || 'own';

    // TODO: should default to null rather than 0
    const paramId = parseInt(id || '0');
    const paramObj = parseInt(obj || '0');
    const paramVer = parseInt(ver || '0');

    const queryParams = new URLSearchParams(this.props.location.search);
    const paramLimit = queryParams.get('limit');
    const limit = paramLimit ? parseInt(paramLimit) : 0;
    const search = queryParams.get('search') || '';
    const sort = queryParams.get('sort') || sortSlugDefault;
    const view = queryParams.get('view') || 'data';
    if (this.state.loading) return <>Loading...</>;
    return (
      <section
        className="ph4 bg-light-gray"
        style={{ flex: '1 1 0px', display: 'flex', flexDirection: 'column' }}
      >
        <AuthContext.Consumer>
          {(value) => {
            switch (value.status) {
              case AsyncProcessStatus.NONE:
              case AsyncProcessStatus.PENDING:
                return this.renderLoading();
              case AsyncProcessStatus.ERROR:
                return this.renderError(value.message);
              case AsyncProcessStatus.SUCCESS:
                if (value.value.status !== AuthenticationStatus.AUTHENTICATED) {
                  return this.renderUnauthenticated();
                }
                return (
                  <NarrativeList
                    authInfo={value.value.authInfo}
                    category={category}
                    history={this.props.history}
                    id={paramId}
                    limit={limit}
                    obj={paramObj}
                    search={search}
                    sort={sort}
                    ver={paramVer}
                    view={view}
                  />
                );
            }
          }}
        </AuthContext.Consumer>
      </section>
    );
  }
}
