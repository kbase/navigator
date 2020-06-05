import React, { Component } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';

interface State {}

export default class SharingItem extends Component<
  ControlMenuItemProps,
  State
> {
  render() {
    return <div>I'm a sharing component!</div>;
  }
}
