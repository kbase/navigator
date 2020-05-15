import React, { Component } from 'react';
import IconProvider, { IconInfo, AppTag } from '../../api/iconProvider';
import { Cell } from '../../utils/narrativeData';

/**
 * Generates various KBase Narrative icons from input props.
 */

interface TypeProps {
  objType: string;
}

interface AppIconProps {
  appId: string;
  appTag: string;
}

interface DefaultIconProps {
  cellType: string;
}

// Font-awesome class names for each narrative cell type
enum CellIcons {
  code_cell = 'fa fa-code',
  kbase_app = 'fa fa-cube',
  markdown = 'fa fa-paragraph',
  widget = 'fa fa-wrench',
  data = 'fa fa-database',
}

export function TypeIcon(props: TypeProps) {
  const iconProvider = IconProvider.Instance;
  const iconInfo = iconProvider.typeIcon(props.objType);
  return (
    <span className="fa-stack fa-lg">
      <span
        className="fa fa-circle fa-stack-2x"
        style={{ color: iconInfo.color }}
      />
      <span className={`fa fa-inverse fa-stack-1x ${iconInfo.icon}`} />
    </span>
  );
}

interface AppIconState {
  isLoading: boolean;
  iconInfo?: IconInfo
}

export class AppCellIcon extends Component<AppIconProps, AppIconState> {
  constructor(props: AppIconProps, state: AppIconState) {
    super(props);
    this.state = {
      isLoading: true
    };
  }

  async componentDidMount() {
    const iconProvider = IconProvider.Instance;
    const iconInfo = await iconProvider.appIcon(this.props.appId, this.props.appTag as AppTag);
    this.setState({
      isLoading: false,
      iconInfo: iconInfo
    });
  }

  render() {
    const iconInfo = this.state.iconInfo ? this.state.iconInfo : { isImage: false, icon: 'fa fa-spinner', color: 'silver'};

    if (iconInfo.isImage) {
      return (
        <span>
          <img src={iconInfo.url} style={{maxWidth: '2.5em', maxHeight: '2.5em', margin: 0}} />
        </span>
      );
    }
    else {
      return (
        <span className="fa-stack fa-lg">
          <span className="fa fa-square fa-stack-2x" style={{color: iconInfo.color}} />
          <span className={`fa fa-inverse fa-stack-1x ${iconInfo.icon}`} />
        </span>
      );
    }
  }
}

export function CellIcon(cellType: string) {
  return (
    <span className="fa-stack fa-lg">
      <span className="fa fa-square fa-stack-2x" />
      <span className={`fa fa-inverse fa-stack-1x fa-cube`} />
    </span>
  );
}

export function DefaultIcon(props: DefaultIconProps) {
  let icon = 'fa-code';
  switch(props.cellType) {
    case 'code':
      icon = CellIcons.code_cell;
      break;
    case 'markdown':
      icon = CellIcons.markdown;
      break;
    case 'data':
      icon = CellIcons.data;
      break;
    case 'app':
      icon = CellIcons.kbase_app;
      break;
    default:
      icon = CellIcons.widget;
      break;
  }
  return (
    <span className="fa-stack fa-lg">
      <span className="fa fa-square fa-stack-2x" style={{ color: 'silver'}}/>
      <span className={`fa fa-inverse fa-stack-1x ${icon}`} />
    </span>
  )
}
