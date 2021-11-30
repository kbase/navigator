import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { keepParamsLinkTo } from '../utils';
import { Doc } from '../../../utils/narrativeData';
import { VersionDropdown } from './VersionDropdown';
import { History } from 'history';

const timeago = require('timeago.js');

interface Props {
  category: string;
  items: Array<Doc>;
  loading: boolean;
  onSelectItem?: (idx: number) => void;
  pageSize: number;
  selected: string;
  selectedIdx: number;
  sort?: string;
  totalItems: number;
  history: History;
}

interface State {}

// Active and inactive classnames for the item listing
const itemClasses = {
  active: {
    inner: 'narrative-item-inner',
    outer: 'narrative-item-outer active',
  },
  inactive: {
    inner: 'narrative-item-inner',
    outer: 'narrative-item-outer inactive',
  },
};

// Simple UI for a list of selectable search results
export class ItemList extends Component<Props, State> {
  selectItem(idx: number) {
    if (idx < 0 || idx >= this.props.items.length) {
      throw new Error(`Invalid index for ItemList: ${idx}.
        Max is ${this.props.items.length - 1} and min is 0.`);
    }
    if (this.props.onSelectItem) {
      this.props.onSelectItem(idx);
    }
  }

  state = {};

  // Handle click event on an individual item
  handleClickItem(idx: number) {
    this.selectItem(idx);
  }

  /**
   * Creates a view for a single Narrative item.
   * @param {Doc} item - the Narrative to show.
   * @param {number} idx - the index of the narrative being shown. Used to
   *   communicate to the onSelectItem prop.
   * @return {JSX} narrative selection link
   */
  itemView = (item: Doc, idx: number) => {
    // I need this until I figure out what's in item
    const status = this.props.selectedIdx === idx ? 'active' : 'inactive';
    const css = itemClasses[status];
    const { selected } = this.props;

    // have link point to previous version if a previous version is selected
    let upa = `${item.access_group}/${item.obj_id}`;
    if (upa === selected.split('/').slice(0,2).join('/')) {
      upa += `/${selected.split('/')[2]}`;
    } else {
      upa += `/${item.version}`;
    }
    const keepParams = (link: string) =>
      keepParamsLinkTo(['limit', 'search', 'sort', 'view'], link);
    const { category } = this.props;
    const prefix = '/' + (category === 'own' ? '' : `${category}/`);
    // Action to select an item to view details
    return (
      <Link
        className="narrative-item"
        key={upa}
        onClick={() => this.handleClickItem(idx)}
        to={keepParams(prefix + `${upa}/`)}
      >
        <div className={css.outer}>
          <div className={css.inner}>
            <div className="ma0 mb2 pa0 f5">
              {item.narrative_title || 'Untitled'}
              {this.renderDropdown(upa, item.version)}
            </div>
            <p className="ma0 pa0 f7">
              Updated {timeago.format(item.timestamp)} by {item.creator}
            </p>
          </div>
          <div className="center bb b--black-20"></div>
        </div>
      </Link>
    );
  };

  renderDropdown(upa: string, version: number) {
    const { selected } = this.props;
    const selectedNarr = selected.substring(0, selected.lastIndexOf('/'));
    const selectedVersion = +selected.split('/')[2];
    const narr = upa.substring(0, upa.lastIndexOf('/'));
    if (narr !== selectedNarr) {
      return <></>
    }
    return <VersionDropdown
              upa={upa}
              version={version}
              selectedVersion={selectedVersion}
              category={this.props.category}
              history={this.props.history}
            />
  }

  hasMoreButton() {
    const { items, pageSize, totalItems } = this.props;
    const hasMore = items.length < totalItems;
    if (!hasMore) {
      return <span className="black-50 pa3 dib tc">No more results.</span>;
    }
    if (this.props.loading) {
      return (
        <span className="black-60 pa3 tc dib">
          <i className="fa fa-cog fa-spin mr2"></i>
          Loading...
        </span>
      );
    }
    const keepParams = (link: string) =>
      keepParamsLinkTo(['sort', 'view', 'search'], link);
    return (
      <Link
        className="tc pa3 dib pointer blue dim b"
        to={keepParams(`./?limit=${items.length + pageSize}`)}
      >
        Load more ({this.props.totalItems - this.props.items.length} remaining)
      </Link>
    );
  }

  render() {
    const { items } = this.props;
    if (!items || !items.length) {
      if (this.props.loading) {
        // No results but still loading:
        return (
          <div className="w-100 tc black-50">
            <p className="pv5">
              <i className="fa fa-cog fa-spin mr2"></i>
              Loading...
            </p>
          </div>
        );
      } else {
        // No results and not loading
        return (
          <div className="w-100 tc black-80">
            <p className="pv5"> No results found. </p>
          </div>
        );
      }
    }
    return (
      <div className="w-40 ba b--black-20">
        {items.map((item, idx) => this.itemView(item, idx))}
        {this.hasMoreButton()}
      </div>
    );
  }
}
