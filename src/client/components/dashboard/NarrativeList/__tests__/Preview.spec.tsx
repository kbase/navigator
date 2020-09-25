/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';

import { PreviewCell } from '../Preview';

describe('Preview tests', () => {
  it('<PreviewCell> should render', () =>
    expect(
      shallow(
        <PreviewCell
          key={0}
          title="title"
          cellType="markdown"
          metaName=""
          subtitle="title subtitle"
          tag=""
        />
      )
    ).toBeTruthy());
});
