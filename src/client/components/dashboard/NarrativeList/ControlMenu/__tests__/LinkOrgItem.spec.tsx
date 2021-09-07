/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import { enableFetchMocks } from 'jest-fetch-mock';

import LinkOrgItem from '../LinkOrgItem';
import { Doc } from '../../../../../utils/NarrativeModel';
import ControlMenuItemProps from '../ControlMenuItemProps';

enableFetchMocks();

describe('LinkOrgItem', () => {
  test('with no no member groups should render', async () => {
    // The app will have set these, probably when the global header is loaded.
    // We can't set
    // document.cookie = 'kbase_session=bar';
    // because the token isn't processed by this component.
    window._env.username = 'foo';
    window._env.token = 'bar';

    fetchMock.mockIf(
      /https:\/\/ci.kbase.us\/services\/.*/,
      async (req: Request) => {
        if (req.url.includes('/groups/')) {
          if (req.url.endsWith('group?resourcetype=workspace&resource=1')) {
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
          return {
            body: JSON.stringify({
              version: '1.1',
              result: [
                {
                  perms: [
                    {
                      foo: 'a',
                    },
                  ],
                },
              ],
            }),
          };
        }
        throw new Error(`Not handled: ${req.url}`);
      }
    );
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
    const props: ControlMenuItemProps = {
      authInfo: {
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
      },
      narrative,
      cancelFn: () => {},
      doneFn: () => {},
    };
    const component = shallow(<LinkOrgItem {...props} />);

    async function waitFor(
      fun: () => boolean,
      timeout: number
    ): Promise<boolean> {
      const started = Date.now();
      return new Promise((resolve, reject) => {
        const loop = () => {
          if (fun()) {
            resolve(true);
          } else if (Date.now() - started > timeout) {
            reject(new Error(`waitFor did not complete within ${timeout}ms`));
          } else {
            window.setTimeout(() => {
              loop();
            }, 100);
          }
        };
        loop();
      });
    }
    return expect(
      waitFor(() => {
        return component
          .text()
          .includes('This Narrative is not linked to any organizations.');
      }, 1000)
    ).resolves.toBeTruthy();
  });
});
