/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';

import { Page, Todo } from '../';

describe('Client component tests', () => {
  it('<Page /> should be callable', () =>
    expect(shallow(<Page />)).toBeTruthy());

  it('<Todo /> should be callable', () =>
    expect(shallow(<Todo />)).toBeTruthy());
});
