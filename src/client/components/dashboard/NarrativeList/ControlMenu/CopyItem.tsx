import React, { Component } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';

interface State {}

export default class CopyItem extends Component<ControlMenuItemProps, State> {
  render() {
    return <div>I'm a copy component!</div>;
  }
}
