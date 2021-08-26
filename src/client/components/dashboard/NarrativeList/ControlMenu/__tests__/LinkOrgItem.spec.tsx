/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import { enableFetchMocks } from 'jest-fetch-mock';

import LinkOrgItem from '../LinkOrgItem';
import { Doc } from '../../../../../utils/narrativeData';

enableFetchMocks();

describe('LinkOrgItem', () => {
  it('with no no member groups should render', () => {
    // Note I added the mocking below to make this test pass, but using empty
    // mock data only exercises that specific case.
    window._env.username = 'foo';
    window._env.token = 'bar';
    fetchMock.mockIf('https://ci.kbase.us/services', async (req: Request) => {
      console.log('mock 1');
      if (req.url.includes('/groups/')) {
        console.log('mock 2');
        if (req.url.endsWith('/group')) {
          return Promise.resolve({
            body: JSON.stringify([]),
            status: 200,
          });
        } else if (req.url.endsWith('/member')) {
          return Promise.resolve({
            body: JSON.stringify([]),
          });
        }
      } else if (req.url.endsWith('/ws')) {
        console.log('mock ws');

        return {
          body: JSON.stringify({
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
          }),
        };
      }
      throw new Error('Not handled');
    });
    /*
    Note that the 'foo' in the perms above needs to match the test config user.
    The user used in getCurrentUserPermission is that returend by Runtime.username(),
    which matches Runtime.token(). .username() actually gets it's value from
    window._env.username (_env appears to be used as a global namespace !?).
    getToken() simply takes the value of the cookie 'kbase_session'
    */
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
    expect(shallow(<LinkOrgItem {...props} />)).toBeTruthy();
  });
});
