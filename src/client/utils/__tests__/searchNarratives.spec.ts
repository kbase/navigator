/**
 * @jest-environment jsdom
 */

/* Noting here that these are very much unit tests. Just want to test how the
 * code deals with expected results and errors from the search service.
 * Integration tests are elsewhere. This doesn't actually mock expected behavior
 * from the search service, or even interpreting terms being sent to the service,
 * just making sure that this client runs through cases correctly.
 */
import { enableFetchMocks } from 'jest-fetch-mock';
import { AuthInfo } from '../../components/Auth';
enableFetchMocks();
// as of now eslint cannot detect when imported interfaces are used
import {
  sorts,
  NarrativeSearch,
  SearchOptions, // eslint-disable-line no-unused-vars
} from '../searchNarratives';

const VALID_TOKEN = 'some_valid_token';
const TEST_USER = 'some_user';

/**
 * This returns a list of narrative doc elements.
 * @param {string} owner, the 'owner' of the fake narrative
 * @param {number} first, the first id / name / etc in the list of narratives
 * @param {number} count the total number of narratives to return
 * @return {array}
 */
function fakeNarratives(owner: string, first: number = 0, count: number) {
  const docs = [];
  for (let id = first; id < count + first; id++) {
    docs.push({
      access_group: id,
      cells: [],
      creation_date: '2020-07-17T22:04:00+0000',
      creator: owner,
      data_objects: [],
      is_public: false,
      narrative_title: `Narrative #${id}`,
      obj_id: 1,
      obj_name: `Narrative.${id}`,
      obj_type_module: 'KBaseNarrative',
      obj_type_name: 'Narrative',
      obj_type_version: '4.0',
      shared_users: [owner],
      tags: ['narrative'],
      timestamp: 1595023480707,
      total_cells: 1,
      version: 1,
    });
  }
  return docs;
}

/**
 * This mocks doing the search in the happy case. Assumes no errors and that
 * the auth token (if needed) is valid.
 * @param {SearchOptions} param0 - should be same as passed to searchNarratives
 * @param {string} owner
 */
function mockSearchOk(
  { term, sort, category, skip, pageSize }: SearchOptions,
  owner: string
) {
  // mock should return up to the page size requested.
  // use a fake list of narratives.
  fetchMock.mockResponse(async (req) => {
    const authHeader = req.headers.get('Authorization');
    const reqBody = await req.json();
    const isPublic = reqBody.params.access && reqBody.params.access.only_public;
    const response = {
      jsonrpc: '2.0',
      id: '12345',
      result: {
        count: pageSize,
        search_time: 1,
        hits: fakeNarratives(owner, skip, pageSize),
      },
    };
    if (authHeader === VALID_TOKEN) {
      return JSON.stringify(response);
    } else {
      if (isPublic) {
        return JSON.stringify(response);
      } else {
        return {
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: '12345',
            error: {
              code: -32000,
              message: 'WS token validation error',
              data: {
                class: 'RuntimeError',
              },
            },
          }),
          status: 401,
        };
      }
    }
  });
}

function setValidToken() {
  document.cookie = `kbase_session=${VALID_TOKEN}`;
}

function setInvalidToken() {
  document.cookie = `kbase_session=NOPE.`;
}

const authInfo: AuthInfo = {
  token: 'some_valid_token',
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

const invalidAuthInfo: AuthInfo = {
  token: 'some_invalid_token',
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

describe('The SearchNarratives.searchNarratives method', () => {
  // afterEach(() => {
  //   document.cookie = 'kbase_session=';
  // });

  it('should return own narratives', async () => {
    /* mocking goes HERE */
    // add token
    // mock endpoint
    // setValidToken();
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    search.clearCache();
    const results = await search.searchNarratives({
      term: '',
      category: 'own',
      sort: '-updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.count).toEqual(results.hits.length);
  });

  // DISABLED - the cache is no longer exposed; we need to rewrite this test
  // to detect whether the cache is used; e.g. put a slow-down timer in the
  // mocked call, and detect the difference in time between the first and second
  // call. We _can_ inspect and manipulate the internal cache, though, as well
  //
  test.skip('searchNarratives should consult the cache first', async () => {
    const searchParams = {
      term: '',
      category: 'own',
      sort: '-updated',
      skip: 0,
      pageSize: 10,
    };
    const search = new NarrativeSearch(authInfo);
    const results = await search.searchNarratives(searchParams);
    expect(results.count).toEqual(1);
    expect(results.count).toEqual(results.hits.length);
  });

  // DISABLED - the Navigator won't even load withouth authentication
  test.skip(
    'searchNarratives should fail to return own narratives when a token is ' +
      'not present',
    async () => {
      mockSearchOk(
        { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
        TEST_USER
      );
      const search = new NarrativeSearch(authInfo);
      await expect(() =>
        search.searchNarratives({
          term: '',
          category: 'own',
          sort: '-updated',
          skip: 0,
          pageSize: 10,
        })
      ).rejects.toThrow();
    }
  );

  test('should fail when a bad token is used', async () => {
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(invalidAuthInfo);
    search.clearCache();
    await expect(() =>
      search.searchNarratives({
        term: '',
        category: 'own',
        sort: '-updated',
        skip: 0,
        pageSize: 10,
      })
    ).rejects.toThrow();
  });

  test('should return an empty set if zero results are found', async () => {
    setValidToken();
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 0 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    search.clearCache();
    const results = await search.searchNarratives({
      term: '',
      category: 'own',
      sort: '-updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(0);
    expect(results.hits).toEqual([]);
  });

  test('should return shared narratives', async () => {
    setValidToken();
    mockSearchOk(
      { term: '', sort: '', category: 'shared', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    search.clearCache();
    const results = await search.searchNarratives({
      term: '',
      category: 'shared',
      sort: '-updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });

  // DISABLED - the narrative navigator does not operate without a token.
  test.skip(
    'should fail to return shared narratives when a token is ' + 'not present',
    async () => {
      mockSearchOk(
        { term: '', sort: '', category: 'shared', skip: 0, pageSize: 10 },
        TEST_USER
      );
      const search = new NarrativeSearch(authInfo);
      await expect(() =>
        search.searchNarratives({
          term: '',
          category: 'shared',
          sort: '-updated',
          skip: 0,
          pageSize: 10,
        })
      ).rejects.toThrow();
    }
  );

  test('should return public narratives', async () => {
    setValidToken();
    mockSearchOk(
      { term: '', sort: '', category: 'public', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    search.clearCache();
    const results = await search.searchNarratives({
      term: '',
      category: 'public',
      sort: '-updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });

  test('should return tutorial narratives', async () => {
    setValidToken();
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    search.clearCache();
    const results = await search.searchNarratives({
      term: '',
      category: 'tutorials',
      sort: '-updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });

  // DISABLED - the Navigator does not operate without authentication
  test.skip('should return tutorials or public narratives without auth', async () => {
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    const results = await search.searchNarratives({
      term: '',
      category: 'tutorials',
      sort: '-updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });

  // DISABLED - but this tests no such thing! This is perhaps better as an integration
  // test against a real database, or a solid mock search service.
  test.skip('should return a subset of narratives when searching by title', async () => {
    setValidToken();
    mockSearchOk(
      { term: 'narr', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    const results = await search.searchNarratives({
      term: 'narr',
      category: 'tutorials',
      sort: '-updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });

  // DISABLED - but this tests no such thing
  test.skip('should sort results automatically by some criteria', async () => {
    // const sortings = Object.keys(sortsLookup);
    mockSearchOk(
      { term: 'narr', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    for (const s of Object.keys(sorts)) {
      const results = await search.searchNarratives({
        term: '',
        category: 'tutorials',
        sort: s,
        skip: 0,
        pageSize: 10,
      });
      expect(results.count).toEqual(10);
      expect(results.hits.length).toEqual(results.count);
    }
  });

  it('should fail on a bad sort request', async () => {
    mockSearchOk(
      { term: 'narr', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    search.clearCache();
    await expect(() =>
      search.searchNarratives({
        term: '',
        category: 'public',
        sort: 'out_of_sorts',
        skip: 0,
        pageSize: 10,
      })
    ).rejects.toThrow();
  });

  it('should fail on a bad search category', async () => {
    mockSearchOk(
      { term: 'narr', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    search.clearCache();
    await expect(() =>
      search.searchNarratives({
        term: '',
        category: 'uncategorized',
        sort: '-updated',
        skip: 0,
        pageSize: 10,
      })
    ).rejects.toThrow();
  });

  // DISABLED - but this tests no such thing.
  it.skip('should skip documents on request', async () => {
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const search = new NarrativeSearch(authInfo);
    search.clearCache();
    const results = await search.searchNarratives({
      term: '',
      category: 'public',
      sort: '-updated',
      skip: 5,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });
});
