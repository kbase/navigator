import React, { Component } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';

interface State {}

export default class RenameItem extends Component<ControlMenuItemProps, State> {
  render() {
    return <div>I'm a rename component!</div>;
  }
}
