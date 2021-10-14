/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';

import CopyItem from '../CopyItem';
import { Doc } from '../../../../../utils/NarrativeModel';
import { AuthInfo } from '../../../../Auth';

const authInfo: AuthInfo = {
  token: 'foo',
  tokenInfo: {
    cachefor: 0,
    created: 0,
    expires: 0,
    id: 'foo',
    name: 'foo',
    type: 'login',
    custom: {},
    user: 'foo',
  },
};

describe('Preview tests', () => {
  it('<CopyItem> should render', () => {
    const narrative: Doc = {
      access_group: 1,
      cells: [],
      copied: null,
      creation_date: '',
      creator: '',
      data_objects: [],
      is_narratorial: false,
      is_public: false,
      is_temporary: false,
      modified_at: 0,
      narrative_title: '',
      obj_id: 0,
      obj_name: '',
      obj_type_module: '',
      obj_type_version: '',
      owner: '',
      shared_users: [],
      tags: [],
      timestamp: 0,
      total_cells: 0,
      version: 0,
    };
    const props = {
      authInfo,
      narrative,
      cancelFn: () => {},
      doneFn: () => {},
    };
    expect(shallow(<CopyItem {...props} />)).toBeTruthy();
  });
});
