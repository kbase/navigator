import React, { Component } from 'react';
import { History } from 'history';
import Select from 'react-select';

import { sorts } from '../../../utils/searchNarratives';

// Components
import { SearchInput } from '../../generic/SearchInput';

import './Filters.css';

interface SearchParams {
  term: string;
  sort: string;
}
// TODO: Is it not exported from react-select?
interface OptionType {
  [key: string]: any;
}

interface State {
  loading: boolean;
  searchParams: SearchParams;
  selectedSort: OptionType;
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
const sortOptions = Object.entries(sorts).map(([value, label]) => {
  return {
    label,
    value,
  };
});

// Filter bar for searching and sorting data results
export class Filters extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      searchParams: this.getSearchParamsFromProps(props),
      selectedSort: this.getSort(this.props.sort),
    };

    // Options will never change after being set once; could just load
    // them from a source file.
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.sort !== this.props.sort) {
      this.setState({
        selectedSort: this.getSort(this.props.sort),
      });
    }
  }

  getSort(sort: string): OptionType {
    for (const [value, label] of Object.entries(sorts)) {
      if (value === sort) {
        return {
          label,
          value,
        };
      }
    }
    // An invalid value  (can this occur? TODO!)
    throw new Error(`Sort option "${sort}" not recognized`);
  }

  getSearchParamsFromProps(props: Props) {
    return {
      term: props.search,
      sort: props.sort,
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

  handleFilterChange(value: any): void {
    const { category } = this.props;
    const sortSlug = value.value;

    // Update the url with the new sort option.
    const queryParams = new URLSearchParams(location.search);

    // This bit of magic removes the 'sort' query parameter if the
    // sort option is the default one (which is the first one).
    // TODO: this might be cute, but i'm not sure what the use is,
    // If a use case for putting state like this into the url is to
    // provide the ability to pass such links around, removing state
    // from the user might be self-defeating if the sort option order
    // ever changes. Nevertheless, the "Recently updated" order will
    // probably always be the default.
    if (sortSlug === sortSlugDefault) {
      queryParams.delete('sort');
    } else {
      queryParams.set('sort', sortSlug);
    }
    const prefix = '/' + (category === 'own' ? '' : `${category}/`);
    const newLocation = `${prefix}?${queryParams.toString()}`;
    this.props.history.push(newLocation);

    // Perform the search update.
    const searchParams = this.state.searchParams;
    searchParams.sort = sortSlug;
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

  renderFilterDropdown() {
    return (
      <span className="SortDropdown">
        <div className="-label">Sort</div>
        <div className="-control" role="listbox">
          <Select
            defaultOptions
            isSearchable={false}
            defaultValue={this.state.selectedSort}
            value={this.state.selectedSort}
            placeholder="Sort by..."
            options={sortOptions}
            display="inline"
            width="10em"
            styles={{
              container: (base) => {
                return {
                  ...base,
                  width: '14em',
                };
              },
            }}
            onChange={this.handleFilterChange.bind(this)}
          />
        </div>
      </span>
    );
  }

  render() {
    const refreshIconClasses = [
      'fa fa-refresh',
      this.state.loading ? ' loading' : '',
    ].join('');
    return (
      <div className="Filters">
        {/* Left-aligned actions (eg. search) */}
        <div className="pv3">
          <SearchInput
            loading={this.props.loading}
            onSetVal={this.handleSearch.bind(this)}
            placeholder="Search Narratives"
            value={this.props.search}
          />
        </div>

        {/* Right-aligned actions (eg. filter dropdown) */}
        <div className="pa3">{this.renderFilterDropdown()}</div>
        <button
          className="button refresh"
          onClick={this.handleRefresh.bind(this)}
        >
          Refresh &nbsp;
          <i className={refreshIconClasses}></i>
        </button>
      </div>
    );
  }
}
