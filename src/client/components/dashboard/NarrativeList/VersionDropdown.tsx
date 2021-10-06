import React, { Component, MouseEvent } from 'react';
import { keepParamsLinkTo } from '../utils';
import { History } from 'history'

interface Props {
    upa: string;
    version: number;
    selectedVersion: number;
    category: string;
    history: History
}

interface State {
    versionToggle: boolean;
    selectedVersion: number;
}

export class VersionDropdown extends Component<Props, State> {

    state = {
        versionToggle: false,
        // selectedVersion: this.props.version
        selectedVersion: this.props.selectedVersion
    };

    setVersionToggle(event: MouseEvent) {
        event.preventDefault();
        this.setState(prevState => ({
            versionToggle: !prevState.versionToggle
        }));
    }

    handleSelectVersion(e: MouseEvent, upa: string, version: number) {
        const { history } = this.props;
        const keepParams = (link: string) =>
            keepParamsLinkTo(['limit', 'search', 'sort', 'view'], link);
        history.push(keepParams(upa)(history.location))
        this.setState({
            versionToggle: false,
            selectedVersion: version
        });
        // prevent parent link from redirecting back to current version URL
        e.preventDefault();
    }

    itemView(version: number) {
        let icon;
        const { category } = this.props;
        const prefix = '/' + (category === 'own' ? '' : `${category}/`);
        const [id, obj] = this.props.upa.split('/');
        const newUpa = `${id}/${obj}/${version}`;
        if (this.state.selectedVersion === version) {
          icon = (
            <i className="fa fa-check mr1 dib" style={{ width: '1.5rem' }}></i>
          );
        } else {
          icon = <span className="mr1 dib" style={{ width: '1.5rem' }}></span>;
        }
        return (
                <span
                    key={version}
                    className="db pa2 pointer hover-bg-blue hover-white"
                    // onClick={(e) => this.handleSelectVersion(e, version)}
                    onClick={(e) => this.handleSelectVersion(e, `${prefix}${newUpa}`, version)}
                >
                    {icon}
                    v{version}
                </span>
        )
    }

    render() {
        const { version } = this.props;
        const versions = Array(version).fill(null).map((_, n) => n + 1).reverse();
        return (
            <div className="relative ml2" style={{display: 'inline-block'}}>
            <span onClick={(e) => this.setVersionToggle(e)}>
              <span className="f5 gray i"> v{this.state.selectedVersion}</span>
              <i className="fa fa-caret-down ml1 gray"></i>
            </span>
            {this.state.versionToggle &&
              <div
                className="ba b--black-30 bg-white db fr absolute"
                style={{
                    boxShadow: '0 2px 3px #aaa',
                    zIndex: 1,
                    width: '8rem',
                    maxHeight: '200px',
                    overflowY: 'scroll'
                }}
              >
                {versions.map(ver => this.itemView(ver))}
              </div>
            }
          </div>
        )
    }

}