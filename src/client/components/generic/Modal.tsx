import React, { Component, CSSProperties } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  closeFn: () => void;
}

interface State {
  open: boolean;
}

export default class Modal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { open: true };
  }

  render() {
    const backdropStyle = {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      padding: '5rem',
    };

    const bodyStyle = {
      backgroundColor: 'white',
      borderRadius: '0.25rem',
      top: '30%',
      left: '50%',
      transform: 'translate(-50%, -30%)',
      margin: '0 auto',
      padding: '3rem',
      minHeight: '10rem',
      minWidth: '30rem',
      position: 'fixed',
      border: '1px solid #ccc',
    };
    return this.state.open
      ? createPortal(
          <div
            onClick={this.props.closeFn}
            className=""
            style={backdropStyle as CSSProperties}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-white br2 w"
              style={bodyStyle as CSSProperties}
            >
              {this.props.children}
            </div>
          </div>,
          document.body
        )
      : null;
  }
}
