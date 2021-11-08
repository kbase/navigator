import React from 'react';

// Components
import SubTabs from '../../generic/SubTabs';

// Utils
import { Doc, KBaseCache } from '../../../utils/narrativeData';
import { readableDate } from '../../../utils/readableDate';
import { fetchProfile, fetchProfiles } from '../../../utils/userInfo';
import Runtime from '../../../utils/runtime';
import { keepParamsLinkTo } from '../utils';
import ControlMenu from './ControlMenu/ControlMenu';
import DataView from './DataView';
import Preview from './Preview';
import { LoadingSpinner } from '../../generic/LoadingSpinner';

function detailsHeaderItem(key: string, value: string | JSX.Element[]) {
  return (
    <div className="narrative-details-key">
      {key}: <span className="narrative-details-value">{value}</span>
    </div>
  );
}

function countCellTypes(cells: any[]): any {
  const defaults = {
    markdown: 0,
    code_cell: 0,
    data: 0,
    kbase_app: 0,
    widget: 0,
  };
  return cells.reduce((acc: any, cell: any) => {
    acc[cell.cell_type] += 1;
    return acc;
  }, defaults);
}

function countDataTypes(data: any) {
  const counts: Record<string, number> = {};
  const normalize = (key: any) => {
    const begin = key.indexOf('.') + 1;
    const end = key.lastIndexOf('-');
    return key.slice(begin, end);
  };
  const sortCountDesc = (freq1: [string, number], freq2: [string, number]) => {
    const count1 = freq1[1];
    const count2 = freq2[1];
    return -1 + +(count1 === count2) + 2 * +(count1 < count2);
  };
  data.data_objects.forEach((obj: any) => {
    const key = normalize(obj.obj_type);
    if (!(key in counts)) {
      counts[key] = 0;
    }
    counts[key] = counts[key] + 1;
  });
  const dataPlaces = Object.entries(counts).sort(sortCountDesc).slice(0, 3);
  const out = [<></>, <></>, <></>];
  return out.map((el, ix) => {
    if (ix in dataPlaces) {
      const [dataType, count] = dataPlaces[ix];
      return detailsHeaderItem(dataType, count.toString());
    }
    return el;
  });
}

const profileLink = (username: string, realname: string) => (
  <a key={`${username}-link`} href={`/#user/${username}`} title={username}>
    {realname}
  </a>
);

const detailsSharedWith = (users: string[], profiles: any) => {
  /*
  Convert the string names into a JSX array of arrays of commas and links,
  flatten into a single array and finally slice off the first comma.
  */
  const separator = (key: string) => (
    <React.Fragment key={`${key}-sep`}>, </React.Fragment>
  ); // Turn a comma into a JSX element
  const sharedWithLinks = users
    .map((share: string, ix: number) => {
      let displayName = share;
      if (profiles[ix]) {
        displayName = profiles[ix].user.realname;
      }
      return [separator(share), profileLink(share, displayName)];
    })
    .reduce((acc, elt) => acc.concat(elt), [])
    .slice(1);
  const sharedFirst = sharedWithLinks.slice(0, 20);
  const sharedRest = sharedWithLinks.slice(20);
  let sharedRestDetails = <></>;
  if (sharedRest.length > 0) {
    sharedRestDetails = (
      <>
        <input
          type="checkbox"
          name="narrative-shared-status"
          id="narrative-shared-status"
        />
        <label htmlFor="narrative-shared-status" id="narrative-shared-more">
          ... &nbsp; (<a className="label">show</a> {profiles.length - 10} more)
        </label>
        <span id="narrative-shared-rest">{sharedRest}.</span>
        <label htmlFor="narrative-shared-status" id="narrative-shared-less">
          &nbsp; (<a className="label">show</a> fewer)
        </label>
      </>
    );
  }
  return [
    <div id="narrative-shared" key="narrative-shared">
      <span>{sharedFirst}</span>
      {sharedRestDetails}
    </div>,
  ];
};

/**
 * Shows some basic details, specifically:
 *  - author (user id of owner)
 *  - total cells
 *  - visibility (public or private)
 *  - created date
 *  - data objects
 * @param {Doc} data - a representation of a narrative
 * @param {KBaseCache} cache - service data cache
 * @return {JSX}
 */
const detailsHeader = async (data: Doc, cache: KBaseCache) => {
  if (!data) return <></>;
  const sharedWith = data.shared_users.filter(
    (user: string) => user !== Runtime.username()
  );
  const cellTypeCounts = countCellTypes(data.cells);
  const [gold, silver, bronze] = countDataTypes(data);
  if (!('profiles' in cache)) cache.profiles = {};
  const authorProfile = await fetchProfile(data.creator, cache.profiles);
  const sharedWithProfiles = await fetchProfiles(sharedWith, cache.profiles);
  const authorName = authorProfile.user.realname;
  const sharedWithLinks = detailsSharedWith(sharedWith, sharedWithProfiles);
  return (
    <>
      <div className="narrative-details">
        <div className="col">
          {detailsHeaderItem('Author', [profileLink(data.creator, authorName)])}
          {detailsHeaderItem('Created on', readableDate(data.creation_date))}
          {detailsHeaderItem('Last saved', readableDate(data.timestamp))}
          {detailsHeaderItem(
            'Visibility',
            data.is_public ? 'Public' : 'Private'
          )}
        </div>
        <div className="col">
          {detailsHeaderItem(
            'Data objects',
            data.data_objects.length.toString()
          )}
          {gold}
          {silver}
          {bronze}
        </div>
        <div className="col">
          {detailsHeaderItem('Total cells', data.total_cells.toString())}
          {detailsHeaderItem('App cells', cellTypeCounts.kbase_app)}
          {detailsHeaderItem('Markdown cells', cellTypeCounts.markdown)}
          {detailsHeaderItem('Code Cells', cellTypeCounts.code_cell)}
        </div>
      </div>
      <div className="narrative-details">
        {data.is_public || !sharedWith.length ? (
          <></>
        ) : (
          detailsHeaderItem('Shared with', sharedWithLinks)
        )}
      </div>
    </>
  );
};

interface Props {
  activeItem: Doc;
  cache: KBaseCache;
  updateSearch: () => void;
  view: string;
  category: string;
  // takes precedence over active item if it was fetched from narrative service
  previousVersion: Doc | null
  loading: boolean;
}

interface State {
  activeItem: Doc;
  cache: KBaseCache;
  detailsHeader: JSX.Element;
}

// Narrative details side panel in the narrative listing.
export class NarrativeDetails extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { activeItem, cache } = this.props;
    this.state = {
      activeItem: activeItem,
      cache: cache,
      detailsHeader: <></>,
    };
  }

  async componentDidMount() {
    const detailsHeaderComponent = await detailsHeader(
      this.state.activeItem,
      this.state.cache
    );
    this.setState({
      detailsHeader: detailsHeaderComponent,
    });
  }

  async componentDidUpdate(prevProps: Props) {
    if (prevProps.activeItem === this.props.activeItem) return;
    const detailsHeaderComponent = await detailsHeader(
      this.props.activeItem,
      this.props.cache
    );
    this.setState({
      detailsHeader: detailsHeaderComponent,
    });
  }

  render() {
    const { activeItem, previousVersion, cache, updateSearch, view, category } = this.props;
    if (!activeItem) {
      return <div></div>;
    }
    if (this.props.loading) {
      return (
        <div style={{margin: 'auto'}}>
          <LoadingSpinner loading={true}></LoadingSpinner>
        </div>
      )
    }
    const displayItem = previousVersion || activeItem;
    const wsid = displayItem.access_group;
    const narrativeHref = `${
      Runtime.getConfig().view_routes.narrative
    }/${wsid}`;
    let content: JSX.Element | string = '';
    // Choose which content to show based on selected tab
    switch (view) {
      case 'preview':
        content = <Preview cache={cache} narrative={displayItem} />;
        break;
      case 'data':
      default:
        content = (
          <DataView accessGroup={wsid} dataObjects={displayItem.data_objects} />
        );
        break;
    }
    const keepParams = (link: string) =>
      keepParamsLinkTo(['limit', 'sort', 'search'], link);
    const tabs = Object.entries({
      data: {
        name: 'Data',
        link: keepParams('?view=data'),
      },
      preview: {
        name: 'Preview',
        link: keepParams('?view=preview'),
      },
    });
    return (
      <div
        className="w-60 bg-white pv2 ph3 bt bb br b--black-20"
        style={{
          top: window._env.legacyNav ? '4rem' : '0.75rem',
          position: 'sticky',
        }}
      >
        <div className="flex justify-between mb3 ma0 pa0 pt2">
          <div className="f3">
            <a
              className="blue pointer no-underline dim"
              href={narrativeHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="fa fa-external-link"></span>
              <span className="ml2">
                {displayItem.narrative_title || 'Untitled'}
              </span>
            </a>
            <span className="b f4 gray i ml2">
              v{displayItem.version}
              {previousVersion && <span className="b f4 gray i"> of {activeItem.version}</span>}
            </span>
          </div>
          <div className="ml-auto">
            <ControlMenu
              narrative={displayItem}
              doneFn={() => updateSearch()}
              isCurrentVersion={!previousVersion}
              category={this.props.category}
            />
          </div>
        </div>
        <div>{this.state.detailsHeader}</div>

        <SubTabs tabs={tabs} className="mb3" selected={view} />
        {content}
      </div>
    );
  }
}
