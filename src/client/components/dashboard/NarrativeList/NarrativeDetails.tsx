import React, { Component } from 'react';

// Components
import SubTabs from '../../generic/SubTabs';

// Utils
import { readableDate } from '../../../utils/readableDate';
import { Doc } from '../../../utils/narrativeData';
import Runtime from '../../../utils/runtime';
import ControlMenu from './ControlMenu';
import DataView from './DataView';
import Preview from './Preview';

interface Props {
  activeItem: Doc;
  selectedTabIdx?: number;
}

interface State {
  selectedTabIdx: number;
}

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
      (user: string) => user !== Runtime.username()
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
    const narrativeHref = `${
      Runtime.getConfig().view_routes.narrative
    }/${wsid}`;
    let content: JSX.Element | string = '';
    // Choose which content to show based on selected tab
    switch (selectedTabIdx) {
      case 1:
        content = <Preview narrative={activeItem} />;
        break;
      default:
        content = <DataView dataObjects={activeItem.data_objects} />;
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
