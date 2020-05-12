import React, { Component } from 'react';

// Components
import SubTabs from '../../generic/SubTabs';

// Utils
import { readableDate } from '../../../utils/readableDate';
import { getWSTypeName } from '../../../utils/stringUtils';
import { Cell, Doc } from '../../../utils/narrativeData';
import { Runtime } from '../../../utils/runtime';
import ControlMenu from './ControlMenu';
import DataView from './DataView';

interface Props {
  activeItem: Doc;
  selectedTabIdx?: number;
}

interface State {
  selectedTabIdx: number;
}


// interface DetailedData {
//   access_group: string | number;
//   cells: Array<Cell>;
//   narrative_title: string;
//   shared_users: Array<string>;
//   creator: string;
//   creation_date: number;
//   total_cells: number;
//   data_objects: Array<DataObjects>;
//   is_public: boolean;
//   sharedWith: Array<string>;
// }

const runtime = new Runtime();

// Narrative details side panel in the narrative listing.
export class NarrativeDetails extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      // Index of the selected tab within SubTabs
      selectedTabIdx: this.props.selectedTabIdx || 0,
    };
  }

  // Handle the onSelect callback from SubTabs
  handleOnTabSelect(idx: number) {
    this.setState({ selectedTabIdx: idx });
  }

  /**
   * Shows some basic details, specifically:
   *  - author (user id of owner)
   *  - total cells
   *  - visibility (public or private)
   *  - created date
   *  - data objects
   * @param data
   */
  detailsHeader(data: Doc) {
    const sharedWith = data.shared_users.filter(
      (user: string) => user !== runtime.username()
    );
    return (
      <div className="flex flex-wrap f6 pb3">
        {detailsHeaderItem('Author', data.creator)}
        {detailsHeaderItem('Total cells', String(data.total_cells))}
        {detailsHeaderItem('Visibility', data.is_public ? 'Public' : 'Private')}
        {detailsHeaderItem('Created on', readableDate(data.creation_date))}
        {detailsHeaderItem('Data objects', String(data.data_objects.length))}
        {data.is_public || !sharedWith.length
          ? ''
          : detailsHeaderItem('Shared with', sharedWith.join(', '))}
      </div>
    );
  }

  render() {
    const { activeItem } = this.props;
    if (!activeItem) {
      return <div></div>;
    }

    const { selectedTabIdx } = this.state;
    const wsid = activeItem.access_group;
    const narrativeHref = window._env.narrative + '/narrative/' + wsid;
    let content: JSX.Element | string = '';
    // Choose which content to show based on selected tab
    switch (selectedTabIdx) {
      case 1:
        content = cellPreview(activeItem);
        break;
      default:
        content = <DataView dataObjects={activeItem.data_objects} />; //dataView(activeItem);
        break;
    }
    return (
      <div
        className="w-60 bg-white pv2 ph3 bt bb br b--black-20"
        style={{
          top: window._env.legacyNav ? '4rem' : '0.75rem',
          position: 'sticky',
        }}
      >
        <div className="flex justify-between mb3 ma0 pa0 pt2">
          <div className="f4">
            <a className="blue pointer no-underline dim" href={narrativeHref}>
              <span className="fa fa-external-link"></span>
              <span className="ml2">
                {activeItem.narrative_title || 'Untitled'}
              </span>
            </a>
          </div>
          <div className="ml-auto">
            <ControlMenu narrative={this.props.activeItem} />
          </div>
        </div>
        <div>{this.detailsHeader(activeItem)}</div>

        {/*
          <div className='flex mb3'>
           * Left out for now because this functionality is a pain.
           *  - Share button needs to make a call to the workspace, and we'd have
           *    to build a UI around searching and selecting users.
           *  - Copy button needs to make a call to the "Narrative Service"
           *  dynamic service, which has a copy narrative method. To get the
           *  dyn service url, we'd need to make a call first to the service
           *  wizard. Blech.
           *
           *  A better way to do all this would be to have narrative urls for
           *  copy and share that open up their respective modals.
          <a className='pointer dim ba b--black-30 pa2 br2 dib mr2 black-80'>
            <i className="mr1 fas fa-share"></i>
            Share
          </a>
          <a className='pointer dim ba b--black-30 pa2 br2 dib mr2 black-80'>
            <i className="mr1 fas fa-copy"></i>
            Copy
          </a>
          </div>
        */}
        <SubTabs
          tabs={['Data', 'Preview']}
          onSelectTab={this.handleOnTabSelect.bind(this)}
          selectedIdx={selectedTabIdx}
          className="mb3"
        />
        {content}
      </div>
    );
  }
}

function detailsHeaderItem(key: string, value: string) {
  return (
    <div className="w-third pv1">
      {key}: <span className="b">{value}</span>
    </div>
  );
}

function cellPreviewReducer(all: Array<Cell>, each: Cell): Array<Cell> {
  const prev = all[all.length - 1];
  if (each.cell_type === 'widget' || !each.cell_type.trim().length) {
    // Filter out widgets for now
    // Also, filter out blank cell types
    return all;
  } else if (
    prev &&
    each.cell_type === prev.cell_type &&
    each.desc === prev.desc
  ) {
    // If a previous cell has the same content, increase the previous quantity and don't append
    prev.count = prev.count || 1;
    prev.count += 1;
  } else {
    // Append a new cell
    if (!each.desc.trim().length) {
      // Show some text for empty cells
      each.desc = '(empty)';
    } else {
      // Only take the first 4 lines
      let desc = each.desc
        .split('\n')
        .slice(0, 3)
        .join('\n');
      // Append ellipsis if we've shortened it
      if (desc.length < each.desc.length) {
        desc += '...';
      }
      each.desc = desc;
    }
    all.push(each);
  }
  return all;
}

// Preview of all notebook cells in the narrative
function cellPreview(data: Doc) {
  const leftWidth = 18;
  const maxLength = 16;
  // TODO move this into its own component class
  const truncated = data.cells
    .reduce(cellPreviewReducer, [])
    .slice(0, maxLength);
  const rows = truncated.map((cell, idx) => {
    const faClass = cellIcons[cell.cell_type];
    return (
      <div
        key={idx}
        className="dt-row mb2"
        style={{ justifyContent: 'space-evenly' }}
      >
        <span className="dtc pv2 pr2" style={{ width: leftWidth + '%' }}>
          <i
            style={{ width: '1.5rem' }}
            className={(faClass || '') + ' dib mr2 light-blue tc'}
          ></i>
          <span className="b mr1">
            {cellNames[cell.cell_type] || cell.cell_type || ''}
          </span>
          <span className="black-60 f6">
            {cell.count ? ' ×' + cell.count : ''}
          </span>
        </span>
        <span
          className="dtc pa2 truncate black-70"
          style={{ width: 100 - leftWidth + '%' }}
        >
          {cell.desc}
        </span>
      </div>
    );
  });
  return (
    <div>
      <p className="black-60">
        {data.cells.length} total cells in the narrative:
      </p>
      <div className="dt dt--fixed">{rows}</div>
      {viewFullNarrativeLink(data)}
    </div>
  );
}

// Font-awesome class names for each narrative cell type
const cellIcons: { [key: string]: string } = {
  code_cell: 'fa fa-code',
  kbase_app: 'fa fa-cube',
  markdown: 'fa fa-paragraph',
  widget: 'fa fa-wrench',
  data: 'fa fa-database',
};

// Font-awesome class names for each narrative cell type
enum CellIcons {
  code_cell = 'fa fa-code',
  kbase_app = 'fa fa-cube',
  markdown = 'fa fa-paragraph',
  widget = 'fa fa-wrench',
  data = 'fa fa-database',
}

// Human readable names for each cell type.
const cellNames: { [key: string]: string } = {
  code_cell: 'Code',
  markdown: 'Text',
  kbase_app: 'App',
  widget: 'Widget',
  data: 'Data',
};

function viewFullNarrativeLink(data: Doc) {
  const wsid = data.access_group;
  const narrativeHref = window._env.narrative + '/narrative/' + wsid;
  return (
    <p>
      <a className="no-underline" href={narrativeHref}>
        View the full narrative
      </a>
    </p>
  );
}

