/**
 * Meant to be used for subtabs in a view with larger tabs
 * (or on a page with some main tabs at the top).
 *
 * This is really just a shorthand way to making a horizontal list of
 * "buttons" that activate whatever's bound to the onTabSelect prop.
 */
import React from 'react';
import { TabHeader } from './TabHeader';

export default class SubTabs extends TabHeader {
  render() {
    const { tabs } = this.props;
    const { selectedIdx } = this.state;
    return (
      <div className="w-100 bt bb b--black-20">
        <ul className="pa0 ma0 tc b w-100">
          {tabs.map((tabText, idx) => {
            const className =
              selectedIdx === idx ? tabClasses.active : tabClasses.inactive;
            return (
              <li
                key={tabText}
                className={className}
                onClick={() => this.handleClickTab(idx)}
                style={{ userSelect: 'none', float: 'none' }}
              >
                {tabText}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

const tabClasses = {
  active: 'dib pv3 ph3 green',
  inactive: 'dib pv3 ph3 pointer dim',
};
