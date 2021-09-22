import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { History } from 'history';
import { sorts } from '../../utils/searchNarratives';

// Components
import { NarrativeList } from './NarrativeList';
import { AuthInfo } from '../Auth';

import './Dashboard.css';

interface RouteParams {
  category?: string;
  id?: string;
  obj?: string;
  ver?: string;
}

interface Props extends RouteComponentProps<RouteParams> {
  history: History;
  authInfo: AuthInfo;
}

interface State {}

const sortSlugDefault = Object.keys(sorts)[0];

// Parent page component for the dashboard page
export class Dashboard extends Component<Props, State> {
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
    return (
      <section className="ph4 bg-light-gray Dashboard">
        <NarrativeList
          authInfo={this.props.authInfo}
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
      </section>
    );
  }
}
