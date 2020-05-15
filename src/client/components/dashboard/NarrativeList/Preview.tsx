import React, { Component } from 'react';
import { Doc, Cell, fetchNarrative } from '../../../utils/narrativeData';
import {
  CellIcon,
  TypeIcon,
  AppCellIcon,
  DefaultIcon,
} from '../../generic/Icon';

interface Props {
  narrative: Doc;
}

interface State {
  isLoading: boolean;
  narrObj: any; // gets fetched from Workspace.
  cells: Array<any>;
  error: any;
}

interface PreviewCellProps {
  cellType: string;
  title: string;
  subtitle?: string;
  metaName: string; // context dependent - either app id, obj type, null
  tag?: string | null;
}

// Human readable names for each cell type.
const cellNames: { [key: string]: string } = {
  code_cell: 'Code',
  markdown: 'Text',
  kbase_app: 'App',
  widget: 'Widget',
  data: 'Data',
};

export default class Preview extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      narrObj: null,
      cells: [],
      error: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.narrative.access_group !== this.props.narrative.access_group ||
      prevProps.narrative.obj_id !== this.props.narrative.obj_id ||
      prevProps.narrative.version !== this.props.narrative.version
    ) {
      this.fetchNarrativeObject();
    }
  }

  componentDidMount() {
    this.fetchNarrativeObject();
  }

  fetchNarrativeObject() {
    this.setState({ isLoading: true });
    const upa = `${this.props.narrative.access_group}/${this.props.narrative.obj_id}/${this.props.narrative.version}`;
    return fetchNarrative(upa)
      .then(narr => {
        narr = narr.data[0].data;
        let cells = narr.cells ? narr.cells : [];
        this.setState({
          isLoading: false,
          narrObj: narr,
          cells: cells,
          error: null,
        });
      })
      .catch(error => {
        this.setState({ isLoading: false, error: error });
      });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <div className="w-100 tc black-50">
          <p className="pv5">
            <i className="fa fa-cog fa-spin mr2"></i>
            Loading...
          </p>
        </div>
      );
    } else if (this.state.error) {
      return this.renderError(this.state.error);
    }
    const maxLength = 16;

    const truncated = this.state.cells.slice(0, maxLength);

    const rows = truncated.map((cell, idx) => {
      const metadata = cell.metadata?.kbase || {};
      const title = metadata?.attributes?.title;
      const subtitle = metadata?.attributes?.subtitle || cell.source;
      const cellType = metadata.type ? metadata.type : cell.cell_type;
      let metaName = null;
      let tag = null;
      switch (cellType) {
        case 'app':
          metaName = metadata?.appCell?.app?.id;
          tag = metadata?.appCell?.app?.tag;
          break;
        case 'data':
          metaName = metadata?.dataCell?.objectInfo?.typeName;
          break;
      }
      return (
        <PreviewCell
          key={idx}
          title={title}
          cellType={cellType}
          metaName={metaName}
          subtitle={subtitle}
          tag={tag}
        />
      );
    });
    return (
      <div>
        <div>{rows}</div>
        {this.viewFullNarrativeLink(this.props.narrative.access_group)}
      </div>
    );
  }

  viewFullNarrativeLink(wsid: number) {
    const narrativeHref = window._env.narrative + '/narrative/' + wsid;
    return (
      <p>
        <a className="no-underline" href={narrativeHref}>
          View the full narrative
        </a>
      </p>
    );
  }

  renderError(error: any) {
    let msg = error?.data?.message;
    return (
      <div className="pt3">
        <div>An error happened while getting narrative info:</div>
        <pre>{msg}</pre>
      </div>
    );
  }
}

class PreviewCell extends Component<PreviewCellProps> {
  render() {
    const leftWidth = 18;
    let icon;
    switch (this.props.cellType) {
      case 'app':
        let tag = this.props.tag || 'dev';
        icon = <AppCellIcon appId={this.props.metaName} appTag={tag} />;
        break;
      case 'data':
        icon = <TypeIcon objType={this.props.metaName} />;
        break;
      default:
        icon = <DefaultIcon cellType={this.props.cellType} />;
        break;
    }

    return (
      <div className="flex flex-row flex-nowrap pv3 pl2">
        <div>{icon}</div>
        <div className="ml4" style={{ minWidth: 0 }}>
          <div className="">{this.props.title}</div>
          <div className="black-80 f6 mt1 truncate" style={{}}>
            {this.props.subtitle}
          </div>
        </div>
      </div>
    );
  }
}
