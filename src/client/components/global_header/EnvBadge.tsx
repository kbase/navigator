import React from 'react';
import Runtime from '../../utils/runtime';

const ENV_ICONS: { [key: string]: string } = {
  ci: 'fa-flask',
  dev: 'fa-flask',
  next: 'fa-bullseye',
  'narrative-dev': 'fa-thumbs-up',
  'narrative-refactor': 'fa-thumbs-up',
  narrative: '',
  appdev: 'fa-wrench',
  unknown: 'fa-question-circle-o',
};

const DEFAULT_DEV_ICON = 'fa-flask';
const DEFAULT_ENV_ICON = 'fa-flask';

export interface EnvBadgeProps {
  env?: string;
  envIcon?: string;
}

export default class EnvBadge extends React.Component<EnvBadgeProps> {
  getIcon() {
    const matches = Runtime.getConfig().host_root.match(
      /\/\/(?:(.*?)\.)?kbase\.us$/
    );

    // This is the case in which the app is running locally, probably localhost or 127.0.0.1
    if (matches === null) {
      return {
        className: DEFAULT_DEV_ICON,
        label: 'DEV',
      };
    }

    // Handles the case of prod on https://kbase.us
    if (matches.length === 1) {
      return null;
    }

    const env = matches[1];

    if (env in ENV_ICONS) {
      return {
        className: ENV_ICONS[env],
        label: env.toUpperCase(),
      };
    }

    // Some other development deployment environment
    return {
      className: DEFAULT_ENV_ICON,
      label: env.toUpperCase(),
    };
  }

  render() {
    const classNames: string[] = ['fa', 'fa-2x'];
    const iconDef = this.getIcon();
    if (iconDef === null) {
      return;
    }
    const { className, label } = iconDef;
    classNames.push(className);
    return (
      <div
        className="tc"
        style={{
          padding: '3px',
          margin: '2px',
          marginRight: '4px',
          // height: '58px',
          // minWidth: '34px',
          alignSelf: 'center',
          // marginRight: '24px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            paddingBottom: '4px',
          }}
        >
          {label}
        </div>
        <i
          className={classNames.join(' ')}
          style={{ color: '#2196F3', fontSize: '28px' }}
        ></i>
      </div>
    );
  }
}
