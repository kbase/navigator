/**
 * @jest-environment jsdom
 */
import { enableFetchMocks } from 'jest-fetch-mock';
import { AuthInfo } from '../../components/Auth';
import NarrativeModel, { NarrativeObject } from '../NarrativeModel';

enableFetchMocks();

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
    user: 'some_user',
  },
};

const mockWSGetObjects2Ok = (narr: object) => {
  fetchMock.mockOnce(async (req) => {
    return JSON.stringify({
      id: '12345',
      version: '1.1',
      result: [narr],
    });
  });
};

const mockGetPermissionsMassOk = (perms: { [key: string]: string }) => {
  fetchMock.mockOnce(async () => {
    return JSON.stringify({
      id: '12345',
      version: '1.1',
      result: [
        {
          perms: [perms],
        },
      ],
    });
  });
};

describe('The NarrativeModel class', () => {
  // Cache is internal now; we can test cache behavior with mocking, though.
  // test.skip('Should return a narrative if it exists in the cache', async () => {
  //   const dummyResponse = {
  //     data: [
  //       {
  //         data: {},
  //       },
  //     ],
  //   };
  //   const authInfo: AuthInfo = {
  //     token: 'foo',
  //     tokenInfo: {
  //       cachefor: 0,
  //       created: 0,
  //       expires: 0,
  //       id: 'foo',
  //       name: 'foo',
  //       type: 'login',
  //       custom: {},
  //       user: 'foo',
  //     },
  //   };
  //   const model = new NarrativeModel(authInfo);
  //   model.cache['foo'] = 'bar';
  //   const narrObj = await model.fetchNarrative('123/45/6');
  //   expect(JSON.stringify(narrObj)).toEqual(JSON.stringify(dummyResponse));
  // });

  test('Should return a narrative with the happy case', async () => {
    const narrativeObject: NarrativeObject = {
      nbformat: 1,
      nbformat_minor: 1,
      cells: [],
      metadata: {
        creator: 'foo',
        data_dependencies: [],
        description: 'bar',
        format: 'hmm',
        name: 'baz',
        type: 'thing',
        ws_name: 'myname',
      },
    };
    const dummyResponse = {
      data: [
        {
          data: narrativeObject,
        },
      ],
    };

    mockWSGetObjects2Ok(dummyResponse);
    const model = new NarrativeModel(authInfo);
    model.clearCache();
    const narrObj = await model.fetchNarrative('123/45/6');
    expect(narrObj).toEqual(narrativeObject);
  });

  test('Should return a set of user permissions with the happy case', async () => {
    const perms = { some_user: 'a' };
    mockGetPermissionsMassOk(perms);

    const model = new NarrativeModel(authInfo);
    model.clearCache();

    const fetchedPerms = await model.getCurrentUserPermission(123);
    expect(fetchedPerms).toBe('a');
  });

  // TODO: Yeah, but, in this system, this is not a possible condition.
  // All results from search imply that the narrative is accessible to the
  // current user.
  test('Should return a default of no access when user permissions are not defined', async () => {
    const perms = { other_user: 'a', yet_another_user: 'w' };
    mockGetPermissionsMassOk(perms);

    const model = new NarrativeModel(authInfo);
    model.clearCache();
    const fetchedPerms = await model.getCurrentUserPermission(123);
    expect(fetchedPerms).toBe('n');
  });
});
