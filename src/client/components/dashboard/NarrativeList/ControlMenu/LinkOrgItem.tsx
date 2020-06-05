import React, { Component } from 'react';
import ControlMenuItemProps from './ControlMenuItemProps';

interface State {}

export default class LinkOrgItem extends Component<
  ControlMenuItemProps,
  State
> {
  render() {
    return <div>I'm a link organizations component!</div>;
  }
}
