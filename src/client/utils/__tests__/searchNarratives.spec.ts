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
enableFetchMocks();
// as of now eslint cannot detect when imported interfaces are used
import searchNarratives, {
  sortsLookup,
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
  fetchMock.mockResponse(async req => {
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

describe('searchNarratives tests', () => {
  afterEach(() => {
    document.cookie = 'kbase_session=';
  });

  it('searchNarratives should return own narratives', async () => {
    /* mocking goes HERE */
    // add token
    // mock endpoint
    setValidToken();
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const results = await searchNarratives({
      term: '',
      category: 'own',
      sort: 'Recently updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.count).toEqual(results.hits.length);
  });

  it('searchNarratives should consult the cache first', async () => {
    const searchParams = {
      term: '',
      category: 'own',
      sort: 'Recently updated',
      skip: 0,
      pageSize: 10,
    };
    const results = await searchNarratives(searchParams, {
      [JSON.stringify(searchParams)]: {
        count: 1,
        hits: ['sample result'],
      },
    });
    expect(results.count).toEqual(1);
    expect(results.count).toEqual(results.hits.length);
  });

  it(
    'searchNarratives should fail to return own narratives when a token is ' +
      'not present',
    async () => {
      mockSearchOk(
        { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
        TEST_USER
      );
      await expect(() =>
        searchNarratives({
          term: '',
          category: 'own',
          sort: 'Recently updated',
          skip: 0,
          pageSize: 10,
        })
      ).rejects.toThrow();
    }
  );

  it('searchNarratives should fail when a bad token is used', async () => {
    setInvalidToken();
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    await expect(() =>
      searchNarratives({
        term: '',
        category: 'own',
        sort: 'Recently updated',
        skip: 0,
        pageSize: 10,
      })
    ).rejects.toThrow();
  });

  it('searchNarratives should return an empty set if zero results are found', async () => {
    setValidToken();
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 0 },
      TEST_USER
    );
    const results = await searchNarratives({
      term: '',
      category: 'own',
      sort: 'Recently updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(0);
    expect(results.hits).toEqual([]);
  });

  it('searchNarratives should return shared narratives', async () => {
    setValidToken();
    mockSearchOk(
      { term: '', sort: '', category: 'shared', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const results = await searchNarratives({
      term: '',
      category: 'shared',
      sort: 'Recently updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });

  it(
    'searchNarratives should fail to return shared narratives when a token is ' +
      'not present',
    async () => {
      mockSearchOk(
        { term: '', sort: '', category: 'shared', skip: 0, pageSize: 10 },
        TEST_USER
      );
      await expect(() =>
        searchNarratives({
          term: '',
          category: 'shared',
          sort: 'Recently updated',
          skip: 0,
          pageSize: 10,
        })
      ).rejects.toThrow();
    }
  );

  it('searchNarratives should return public narratives', async () => {
    setValidToken();
    mockSearchOk(
      { term: '', sort: '', category: 'public', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const results = await searchNarratives({
      term: '',
      category: 'public',
      sort: 'Recently updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });

  it('searchNarratives should return tutorial narratives', async () => {
    setValidToken();
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const results = await searchNarratives({
      term: '',
      category: 'tutorials',
      sort: 'Recently updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });

  it('searchNarratives should return tutorials or public narratives without auth', async () => {
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const results = await searchNarratives({
      term: '',
      category: 'tutorials',
      sort: 'Recently updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });

  it('searchNarratives should return a subset of narratives when searching by title', async () => {
    setValidToken();
    mockSearchOk(
      { term: 'narr', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const results = await searchNarratives({
      term: 'narr',
      category: 'tutorials',
      sort: 'Recently updated',
      skip: 0,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });

  it('searchNarratives should sort results automatically by some criteria', async () => {
    const sortings = Object.keys(sortsLookup);
    mockSearchOk(
      { term: 'narr', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    for (const s of sortings) {
      const results = await searchNarratives({
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

  it('searchNarratives should fail on a bad sort request', async () => {
    mockSearchOk(
      { term: 'narr', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    await expect(() =>
      searchNarratives({
        term: '',
        category: 'public',
        sort: 'out_of_sorts',
        skip: 0,
        pageSize: 10,
      })
    ).rejects.toThrow();
  });

  it('searchNarratives should fail on a bad search category', async () => {
    mockSearchOk(
      { term: 'narr', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    await expect(() =>
      searchNarratives({
        term: '',
        category: 'uncategorized',
        sort: 'Recently updated',
        skip: 0,
        pageSize: 10,
      })
    ).rejects.toThrow();
  });

  it('searchNarratives should skip documents on request', async () => {
    mockSearchOk(
      { term: '', sort: '', category: '', skip: 0, pageSize: 10 },
      TEST_USER
    );
    const results = await searchNarratives({
      term: '',
      category: 'public',
      sort: 'Recently updated',
      skip: 5,
      pageSize: 10,
    });
    expect(results.count).toEqual(10);
    expect(results.hits.length).toEqual(results.count);
  });
});
