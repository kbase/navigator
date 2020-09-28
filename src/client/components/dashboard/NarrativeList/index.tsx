import React, { Component } from 'react';
import { History } from 'history';

// Components
import { TabHeader } from '../../generic/TabHeader';
import { Filters } from './Filters';
import { ItemList } from './ItemList';
import { NarrativeDetails } from './NarrativeDetails';
import { Doc } from '../../../utils/narrativeData';

// Utils
import { keepParamsLinkTo } from '../utils';
import Runtime from '../../../utils/runtime';
import searchNarratives, {
  sorts,
  SearchOptions,
} from '../../../utils/searchNarratives';
import { getUsername } from '../../../utils/auth';

// Page length of search results
const PAGE_SIZE = 20;
const NEW_NARR_URL = Runtime.getConfig().host_root + '/#narrativemanager/new';

interface State {
  // Whether we are loading data from the server
  loading: boolean;
  // List of objects of narrative details
  items: Array<Doc>;
  totalItems: number;
  // Currently activated narrative details
  activeIdx: number;
  pages: number;
  // Parameters to send to searchNarratives
  searchParams: SearchOptions;
}

interface Props {
  category: string;
  history: History;
  id: number;
  limit: number;
  obj: number;
  sort: string;
  ver: number;
  view: string;
}

// This is a parent component to everything in the narrative browser (tabs,
// filters, search results, details, etc)
export class NarrativeList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { category, limit } = this.props;
    const sortDefault = Object.values(sorts)[0];
    this.state = {
      totalItems: 0,
      loading: false,
      // List of narrative data
      items: [],
      // Currently active narrative result, selected on the left and shown on the right
      // This is unused if the items array is empty.
      activeIdx: 0,
      // parameters to send to the searchNarratives function
      pages: parseInt((limit / PAGE_SIZE).toString()),
      searchParams: {
        term: '',
        sort: sortDefault,
        category: category,
        pageSize: limit || PAGE_SIZE,
      },
    };
  }

  componentDidMount() {
    // FIXME this is redundant with client/index.tsx
    getUsername(username => {
      window._env.username = username;
      this.performSearch();
    });
  }

  async componentDidUpdate(prevProps: Props) {
    const { category } = this.props;
    const pageSize = this.props.limit || PAGE_SIZE;
    const sort = sorts[this.props.sort];
    const nextSearchParams = { term: '', sort, category, pageSize };
    const performSearchCondition =
      prevProps.category !== this.props.category ||
      prevProps.id !== this.props.id ||
      prevProps.limit !== this.props.limit ||
      prevProps.sort !== this.props.sort;
    if (performSearchCondition) {
      await this.performSearch(nextSearchParams);
      this.setState({
        searchParams: nextSearchParams,
      });
    }
  }

  // Handle an onSetSearch callback from Filters
  handleSearch(searchP: { term: string; sort: string }): void {
    const searchParams = this.state.searchParams;
    searchParams.term = searchP.term;
    searchParams.sort = searchP.sort;
    this.performSearch(searchParams);
  }

  // Handle an onSelectItem callback from ItemList
  // Receives the index of the selected item
  handleSelectItem(idx: number) {
    this.setState({ activeIdx: idx });
  }

  // Perform a search and return the Promise for the fetch
  async performSearch(searchParams?: SearchOptions) {
    if (!searchParams) {
      searchParams = this.state.searchParams;
    }
    this.setState({ loading: true });
    const requestedId = this.props.id;
    const resp = await searchNarratives(searchParams);
    // TODO handle error from server
    if (resp && resp.hits) {
      const total = resp.count;
      const items = resp.hits;
      // Is the requested id in these results?
      const requestedItemArr = items
        .map<[number, Doc]>((item, idx) => [idx, item])
        .filter(([idx, item]) => item.access_group === requestedId);
      let requestedItemIdx = 0;
      if (requestedItemArr.length === 1) {
        requestedItemIdx = requestedItemArr[0][0];
      }
      // If we are loading a subsequent page, append to items. Otherwise, replace them.
      this.setState({
        activeIdx: requestedItemIdx,
        loading: false,
        items,
        totalItems: total,
      });
    }
  }

  render() {
    const { category, id, obj, sort, view, ver } = this.props;
    const upa = `${id}/${obj}/${ver}`;
    const keepSort = (link: string) => keepParamsLinkTo(['sort'], link);
    const tabs = Object.entries({
      own: {
        name: 'My Narratives',
        link: keepSort('/dashboard/'),
      },
      shared: {
        name: 'Shared With Me',
        link: keepSort('/dashboard/shared/'),
      },
      tutorials: {
        name: 'Tutorials',
        link: keepSort('/dashboard/tutorials/'),
      },
      public: {
        name: 'Public',
        link: keepSort('/dashboard/public/'),
      },
    });

    return (
      <div className="bg-light-gray w-100">
        <div
          className="flex justify-between bb b--black-30"
          style={{ alignItems: 'stretch' }}
        >
          {/* Tab sections */}
          <div className="pt2">
            <TabHeader tabs={tabs} selected={category} />
          </div>

          {/* New narrative button */}
          <a
            className="pointer dim dib pa2 white br2 bg-dark-green dib no-underline"
            style={{ marginTop: '1rem', height: '2.25rem' }}
            href={NEW_NARR_URL}
          >
            <i className="mr1 fa fa-plus"></i> New Narrative
          </a>
        </div>

        <div>
          {/* Search, sort, filter */}
          <Filters
            category={category}
            history={this.props.history}
            loading={this.state.loading}
            onSetSearch={this.handleSearch.bind(this)}
            sort={sort}
          />

          {/* Narrative listing and side-panel details */}
          <div className="flex">
            <ItemList
              category={category}
              items={this.state.items}
              loading={this.state.loading}
              onSelectItem={this.handleSelectItem.bind(this)}
              pageSize={PAGE_SIZE}
              selected={upa}
              selectedIdx={this.state.activeIdx}
              sort={sort}
              totalItems={this.state.totalItems}
            />

            <NarrativeDetails
              activeItem={this.state.items[this.state.activeIdx]}
              view={view}
              updateSearch={() => this.performSearch()}
            />
          </div>
        </div>
      </div>
    );
  }
}
