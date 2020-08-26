/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';

import { AppCatalog } from '../AppCatalog';

describe('AppCatalog tests', () => {
  it('Should be callable', () => expect(shallow(<AppCatalog />)).toBeTruthy());
});
