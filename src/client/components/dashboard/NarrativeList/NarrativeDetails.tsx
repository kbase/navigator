import React from 'react';

// Components
import SubTabs from '../../generic/SubTabs';

// Utils
import { Doc } from '../../../utils/narrativeData';
import { readableDate } from '../../../utils/readableDate';
import Runtime from '../../../utils/runtime';
import { keepParamsLinkTo } from '../utils';
import ControlMenu from './ControlMenu/ControlMenu';
import DataView from './DataView';
import Preview from './Preview';

/**
 * Shows some basic details, specifically:
 *  - author (user id of owner)
 *  - total cells
 *  - visibility (public or private)
 *  - created date
 *  - data objects
 * @param {Doc} data - a representation of a narrative
 * @return {JSX}
 */
const detailsHeader = (data: Doc) => {
  const sharedWith = data.shared_users.filter(
    (user: string) => user !== Runtime.username()
  );
  const cellTypeCounts = countCellTypes(data.cells);
  /*
  Convert the string names into a JSX array of arrays of commas and links,
  flatten into a single array and finally slice off the first comma.
  */
  const separator = (key: String) => (
    <React.Fragment key={`${key}-sep`}>, </React.Fragment>
  ); // Turn a comma into a JSX element
  const sharedWithLinks = sharedWith
    .map((share: String) => [
      separator(share),
      <a key={`${share}-link`} href={`/#user/${share}`}>
        {share}
      </a>,
    ])
    .reduce((acc, elt) => acc.concat(elt), [])
    .slice(1);
  return (
    <div className="flex flex-wrap f6 pb3">
      {detailsHeaderItem('Author', data.creator)}
      {detailsHeaderItem('Total cells', String(data.total_cells))}
      {detailsHeaderItem('Visibility', data.is_public ? 'Public' : 'Private')}
      {detailsHeaderItem('Created on', readableDate(data.creation_date))}
      {detailsHeaderItem('Last saved', readableDate(data.timestamp))}
      {detailsHeaderItem('Data objects', String(data.data_objects.length))}
      {detailsHeaderItem('App cells', cellTypeCounts.kbase_app)}
      {detailsHeaderItem('Markdown cells', cellTypeCounts.markdown)}
      {detailsHeaderItem('Code Cells', cellTypeCounts.code_cell)}
      {data.is_public || !sharedWith.length ? (
        <></>
      ) : (
        detailsHeaderItem('Shared with', sharedWithLinks)
      )}
    </div>
  );
};

interface Props {
  activeItem: Doc;
  updateSearch: () => void;
  view: string;
}

// Narrative details side panel in the narrative listing.
export const NarrativeDetails: React.FC<Props> = ({
  activeItem,
  updateSearch,
  view,
}) => {
  if (!activeItem) {
    return <div></div>;
  }
  const wsid = activeItem.access_group;
  const narrativeHref = `${Runtime.getConfig().view_routes.narrative}/${wsid}`;
  let content: JSX.Element | string = '';
  // Choose which content to show based on selected tab
  switch (view) {
    case 'preview':
      content = <Preview narrative={activeItem} />;
      break;
    case 'data':
    default:
      content = (
        <DataView accessGroup={wsid} dataObjects={activeItem.data_objects} />
      );
      break;
  }
  const keepParams = (link: string) =>
    keepParamsLinkTo(['limit', 'sort'], link);
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
              {activeItem.narrative_title || 'Untitled'}
            </span>
          </a>
          <span className="b f4 gray i ml2">v{activeItem.version}</span>
        </div>
        <div className="ml-auto">
          <ControlMenu
            narrative={activeItem}
            doneFn={() => {
              updateSearch();
            }}
          />
        </div>
      </div>
      <div>{detailsHeader(activeItem)}</div>

      <SubTabs tabs={tabs} className="mb3" selected={view} />
      {content}
    </div>
  );
};

function detailsHeaderItem(key: string, value: string | JSX.Element[]) {
  return (
    <div className="w-third pv1">
      {key}: <span className="b">{value}</span>
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
