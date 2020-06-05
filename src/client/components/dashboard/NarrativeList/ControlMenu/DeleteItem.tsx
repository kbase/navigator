import React, { Component } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';

interface State {}

export default class DeleteItem extends Component<ControlMenuItemProps, State> {
  render() {
    return <div>I'm a delete component!</div>;
  }
}
