import React, { Component } from 'react';
import { History } from 'history';

import { sorts, sortsLookup } from '../../../utils/searchNarratives';

// Components
import { FilterDropdown } from '../../generic/FilterDropdown';
import { SearchInput } from '../../generic/SearchInput';
interface SearchParams {
  term: string;
  sort: string;
}
interface State {
  loading: boolean;
  searchParams: SearchParams;
}

interface Props {
  category: string;
  history: History;
  loading: boolean;
  onSetSearch: (searchParams: SearchParams, invalidateCache?: boolean) => void;
  search: string;
  sort: string;
}

const sortSlugDefault = Object.keys(sorts)[0];

// Filter bar for searching and sorting data results
export class Filters extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      searchParams: this.getSearchParamsFromProps(props),
    };
    this.handleSearch = this.handleSearch.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  componentDidMount() {
    this.handleFilter(this.state.searchParams.sort, false);
  }

  getSearchParamsFromProps(props: Props) {
    return {
      term: props.search,
      sort: sorts[props.sort],
    };
  }

  // Handle an onSetVal event from SearchInput
  handleSearch(val: string): void {
    const searchParams = this.state.searchParams;
    const queryParams = new URLSearchParams(location.search);
    if (!val) {
      queryParams.delete('search');
    } else {
      queryParams.set('search', val);
    }
    this.props.history.push(`?${queryParams.toString()}`);
    searchParams.term = val;
    this.props.onSetSearch(searchParams);
  }

  // Handle an onSelect event from FilterDropdown
  handleFilter(val: string, updateLocation: boolean = true): void {
    const { category } = this.props;
    if (updateLocation) {
      const queryParams = new URLSearchParams(location.search);
      const sortSlug = sortsLookup[val];
      if (sortSlug === sortSlugDefault) {
        queryParams.delete('sort');
      } else {
        queryParams.set('sort', sortSlug);
      }
      const prefix = '/' + (category === 'own' ? '' : `${category}/`);
      const newLocation = `${prefix}?${queryParams.toString()}`;
      this.props.history.push(newLocation);
    }
    const searchParams = this.state.searchParams;
    searchParams.sort = val;
    this.setState({ searchParams });
    if (this.props.onSetSearch) {
      this.props.onSetSearch(searchParams);
    }
  }

  async handleRefresh(evt: any) {
    const searchParams = this.getSearchParamsFromProps(this.props);
    if (this.props.onSetSearch) {
      this.setState({ loading: true });
      await this.props.onSetSearch(searchParams, true);
    }
    this.setState({
      loading: false,
      searchParams,
    });
  }

  render() {
    const dropdownItems = Object.values(sorts);
    const searchParams = this.state.searchParams;
    const selectedSort = sorts[this.props.sort] || searchParams.sort;
    const selectedIdx = dropdownItems.indexOf(selectedSort);
    const refreshIconClasses = [
      'fa fa-refresh',
      this.state.loading ? ' loading' : '',
    ].join('');
    return (
      <div className="filters">
        {/* Left-aligned actions (eg. search) */}
        <div className="pv3">
          <SearchInput
            loading={this.props.loading}
            onSetVal={this.handleSearch}
            placeholder="Search Narratives"
            value={this.props.search}
          />
        </div>

        {/* Right-aligned actions (eg. filter dropdown) */}
        <div className="pa3">
          <FilterDropdown
            onSelect={this.handleFilter.bind(this)}
            selectedIdx={selectedIdx}
            txt={'Sort by'}
            items={dropdownItems}
          />
        </div>
        <button className="button refresh" onClick={this.handleRefresh}>
          Refresh &nbsp;
          <i className={refreshIconClasses}></i>
        </button>
      </div>
    );
  }
}
