import React, { Component } from 'react';
import { History } from 'history';

import { sorts, sortsLookup } from '../../../utils/searchNarratives';

// Components
import { FilterDropdown } from '../../generic/FilterDropdown';
import { SearchInput } from '../../generic/SearchInput';

interface State {
  searchParams: {
    term: string;
    sort: string;
  };
}

interface Props {
  category: string;
  history: History;
  loading: boolean;
  onSetSearch: (searchParams: State['searchParams']) => void;
  sort: string;
}

const sortSlugDefault = Object.keys(sorts)[0];

// Filter bar for searching and sorting data results
export class Filters extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let sort = sortSlugDefault;
    if (props.sort) {
      sort = sorts[props.sort];
    }
    this.state = {
      searchParams: {
        term: '',
        sort: sort,
      },
    };
  }

  componentDidMount() {
    this.handleFilter(this.state.searchParams.sort, false);
  }

  // Handle an onSetVal event from SearchInput
  handleSearch(val: string): void {
    const searchParams = this.state.searchParams;
    searchParams.term = val;
    if (this.props.onSetSearch) {
      this.props.onSetSearch(searchParams);
    }
  }

  // Handle an onSelect event from FilterDropdown
  handleFilter(val: string, updateLocation: boolean = true): void {
    const { category } = this.props;
    const queryParams = new URLSearchParams(location.search);
    const sortSlug = sortsLookup[val];
    if (sortSlug === sortSlugDefault) {
      queryParams.delete('sort');
    } else {
      queryParams.set('sort', sortSlug);
    }
    if (updateLocation) {
      const prefix = '/dashboard/' + (category === 'own' ? '' : `${category}/`);
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

  render() {
    const dropdownItems = Object.values(sorts);
    const searchParams = this.state.searchParams;
    const selectedSort = sorts[this.props.sort] || searchParams.sort;
    const selectedIdx = dropdownItems.indexOf(selectedSort);
    return (
      <div className="bg-light-gray flex">
        {/* Left-aligned actions (eg. search) */}
        <div className="pv3">
          <SearchInput
            loading={Boolean(this.props.loading)}
            onSetVal={this.handleSearch.bind(this)}
            placeholder="Search Narratives"
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
      </div>
    );
  }
}
