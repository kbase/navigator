/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import { enableFetchMocks } from 'jest-fetch-mock';

import RenameItem from '../RenameItem';
import { Doc } from '../../../../../utils/narrativeData';

enableFetchMocks();

describe('RenameItem', () => {
  it('should render', () => {
    fetchMock.mockOnceIf(
      'https://ci.kbase.us/services/ws',
      async (req: Request) => {
        window._env.username = 'foo';
        const response = {
          version: '1.1',
          result: [
            {
              perms: [
                {
                  foo: 'w',
                },
              ],
            },
          ],
        };
        return Promise.resolve({
          body: JSON.stringify(response),
          status: 200,
        });
      }
    );
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
      narrative,
      cancelFn: () => {},
      doneFn: () => {},
    };
    expect(shallow(<RenameItem {...props} />)).toBeTruthy();
  });
});
