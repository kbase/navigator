import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { History } from 'history';

import { sorts } from '../../utils/searchNarratives';

// Components
import { NarrativeList } from './NarrativeList';

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

  render() {
    const { id, obj, ver } = this.props.match.params;
    let category = this.props.match.params.category;
    if (!category) category = 'own';
    const paramId = parseInt(id || '0');
    const paramObj = parseInt(obj || '0');
    const paramVer = parseInt(ver || '0');
    const queryParams = new URLSearchParams(this.props.location.search);
    const paramLimit = queryParams.get('limit');
    const limit = paramLimit ? parseInt(paramLimit) : 0;
    const sort = queryParams.get('sort') || sortSlugDefault;
    const view = queryParams.get('view') || 'data';
    if (this.state.loading) return <>Loading...</>;
    return (
      <section>
        <NarrativeList
          category={category}
          history={this.props.history}
          id={paramId}
          limit={limit}
          obj={paramObj}
          sort={sort}
          ver={paramVer}
          view={view}
        />
      </section>
    );
  }
}
