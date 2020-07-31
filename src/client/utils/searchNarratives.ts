import { getToken } from './auth';
import { Doc } from './narrativeData';
import Runtime from '../utils/runtime';

// Constants
const SEARCH_FIELDS = ['narrative_title', 'creator', 'data_objects'];
const INDEX_NAME = 'narrative';

export interface SearchParams {
  term: string;
  sort: string;
  category: string;
  skip: number;
  pageSize: number;
  musts?: Array<any>;
  mustNots?: Array<any>;
}

interface SearchOptions {
  query: {
    bool: {
      must: Array<object>;
      must_not?: Array<object>;
    };
  };
  pageSize: number;
  auth?: boolean;
  sort?: Array<{ [key: string]: { [key: string]: string } } | string>;
  skip?: number;
}

interface SearchHit {
  id: string;
  index: string;
  doc: Doc;
}

/**
 * The direct response from the SearchAPI2 service.
 * This is (probably) JSON-RPC 2.0 format.
 */
interface JSONRPCResponse {
  jsonrpc: string;
  result: any;
  id: string | null;
}

export interface SearchResults {
  count: number;
  search_time: number;
  aggregations: Object;
  hits: Array<SearchHit>;
}

/**
 * Search narratives using ElasticSearch.
 * `term` is a search term
 * `sortBy` can be one of "Recently updated", "Recently created", "Least recently updated", "Oldest"
 * `category` can be one of:
 *   - 'own' - narratives created by the current user
 *   - 'shared' - narratives shared with the current user
 *   - 'tutorials' - public narratives that are tutorials
 *   - 'public' - all public narratives
 *   - 'pageSize' - page length for search results
 * returns a fetch Promise that results in SearchResults
 *
 * Authentication is a little tricky here. Unauthenticated searches are allowed for things
 * like tutorials and public narratives (and, later, for static narratives). Authentication is required
 * to search by owner. When an incorrect auth token is given, regardless of data permissions,
 * the search request will fail.
 *
 * This gets addressed in this function in the following way:
 *  1. if a user-based search (narratives owned by or shared by) is done, without a token available,
 *     this will throw an AuthError.
 *      (note that actually making the call without a token will just not return any results, this wraps
 *       that to make it obvious)
 *  2. if any search results in a 401 from the server (typically a present, but invalid, token), this
 *     also throws an AuthError.
 * @param param0 - SearchParams
 */
export default async function searchNarratives({
  term,
  category,
  sort = 'Recently updated',
  skip = 0,
  pageSize = 20,
}: SearchParams): Promise<SearchResults> {
  const options: SearchOptions = { query: { bool: { must: [] } }, pageSize };
  // Query constraints for "must" conditions
  const musts = [];
  // Query constraints for "must not" conditions
  const mustNots = [];
  if (term) {
    // Multi-match on narrative fields for the given search term
    musts.push({ multi_match: { query: term, fields: SEARCH_FIELDS } });
  }
  switch (category) {
    case 'own':
      musts.push({ term: { creator: Runtime.username() }});
      options.auth = true;
      break;
    case 'shared':
      musts.push({ term: { shared_users: Runtime.username() }});
      mustNots.push({ term: { creator: Runtime.username() }});
      options.auth = true;
      break;
    case 'public':
      musts.push({ term: { is_public: true } });
      options.auth = false;
      break;
    case 'tutorials':
      musts.push({ term: { is_public: true } });
      options.auth = false;
      musts.push({
        bool: {
          should: [
            { match: { narrative_title: 'tutorial' } },
            { match: { narrative_title: 'narratorial' } },
          ],
        },
      });
      break;
    default:
      throw new Error('Unknown search category');
  }

  if (sort) {
    if (sort === 'Recently created') {
      options.sort = [{ creation_date: { order: 'desc' } }, '_score'];
    } else if (sort === 'Oldest') {
      options.sort = [{ creation_date: { order: 'asc' } }, '_score'];
    } else if (sort === 'Least recently updated') {
      options.sort = [{ timestamp: { order: 'asc' } }, '_score'];
    } else if (sort === 'Recently updated') {
      options.sort = [{ timestamp: { order: 'desc' } }, '_score'];
    } else {
      throw new Error('Unknown sorting method');
    }
  }
  if (skip) {
    options.skip = skip;
  }
  if (musts.length) {
    options.query.bool.must = musts;
  }
  if (mustNots.length) {
    options.query.bool.must_not = mustNots;
  }
  return await (await makeRequest(options)).result;
}

/**
 *
 * @param param0 SearchOptions - this takes a query, number of documents to skip,
 *  sort parameter, auth (boolean, true if we're looking up personal data), and pageSize
 */
async function makeRequest({
  query,
  skip = 0,
  sort,
  auth = true,
  pageSize,
}: SearchOptions): Promise<JSONRPCResponse> {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (!token) {
      throw new Error('Auth token not available for an authenticated search lookup!')
    }
    Object.assign(headers, { Authorization: token });
  }
  const params = {
    indexes: [INDEX_NAME],
    size: pageSize,
    query,
    from: skip,
  };
  if (sort) {
    let sortObj = sort;
    Object.assign(params, { sort: sortObj });
  }
  const result = await fetch(Runtime.getConfig().service_routes.search, {
    method: 'POST',
    headers,
    body: JSON.stringify({ method: 'search_objects', params })
  });
  if (!result.ok) {
    throw new Error('An error occurred while searching - ' + result.status);
  }
  return result.json();
}
