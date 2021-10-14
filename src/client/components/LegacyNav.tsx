import React from 'react';
import Runtime from '../utils/runtime';

export interface LegacyNavProps {}

interface LegacyNavState {}

export class LegacyNav extends React.Component<LegacyNavProps, LegacyNavState> {
  render() {
    const { host_root } = Runtime.getConfig();
    return (
      <div className="legacy-nav">
        <ul>
          <li className="legacy-nav-item selected">
            <a data-hl-legacy-nav="/" href={`${host_root}/narratives`}>
              <i className="fa fa-compass fa-2x icon"></i>
              <div className="title">Navigator</div>
            </a>
          </li>
          <li className="legacy-nav-item">
            <a data-hl-legacy-nav="/orgs" href={`${host_root}/#orgs`}>
              <i className="fa fa-users fa-2x icon"></i>
              <div className="title">Orgs</div>
            </a>
          </li>
          <li className="legacy-nav-item">
            <a
              data-hl-legacy-nav="/catalog"
              href={`${host_root}/#catalog/apps`}
            >
              <i className="fa fa-book fa-2x icon"></i>
              <div className="title">Catalog</div>
            </a>
          </li>
          <li className="legacy-nav-item">
            <a data-hl-legacy-nav="/search" href={`${host_root}/#search`}>
              <i className="fa fa-search fa-2x icon"></i>
              <div className="title">Search</div>
            </a>
          </li>
          <li className="legacy-nav-item">
            <a
              data-hl-legacy-nav="/notifications"
              href={`${host_root}/#jobbrowser`}
            >
              <i className="fa fa-suitcase fa-2x icon"></i>
              <div className="title">Jobs</div>
            </a>
          </li>
          <li className="legacy-nav-item">
            <a
              data-hl-legacy-nav="/account"
              href={`${host_root}/#auth2/account`}
            >
              <i className="fa fa-drivers-license fa-2x icon"></i>
              <div className="title">Account</div>
            </a>
          </li>
          <li className="legacy-nav-item">
            <a data-hl-legacy-nav="/feeds" href={`${host_root}/#feeds`}>
              <i className="fa fa-bullhorn fa-2x icon"></i>
              <div className="title">Feeds</div>
            </a>
          </li>
        </ul>
      </div>
    );
  }
}
