/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';

import { Header } from '../Header';

describe('Header tests', () => {
  it('<Header> should render', () =>
    expect(shallow(<Header title="title" />)).toBeTruthy());
});
