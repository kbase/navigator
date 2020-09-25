/* eslint-disable camelcase */
import { getToken } from './auth';
import { Doc } from './narrativeData';
import Runtime from '../utils/runtime';

// Interface to the searchNarratives function
export interface SearchOptions {
  term: string;
  sort: string;
  category: string;
  skip?: number;
  pageSize: number;
  musts?: Array<any>;
  mustNots?: Array<any>;
}

// Sort direction
enum SortDir {
  Asc = 'asc',
  Desc = 'desc',
}

enum Operator {
  And = 'AND',
  Or = 'OR',
}

// `filters` key in the search query
type FilterClause = FilterBool | FilterField;

// Boolean combination of multiple filters
interface FilterBool {
  operator: Operator;
  fields: Array<FilterClause>;
}

// Filter on a single field
interface FilterField {
  field: string;
  range?: {
    max: number;
    min: number;
  };
  term?: string | boolean;
  not_term?: string;
}

// Parameters we pass to the searchapi2 server
interface SearchParams {
  types: Array<string>;
  include_fields?: Array<string>;
  search?: {
    query: string;
    fields: Array<string>;
  };
  filters?: FilterClause;
  sorts?: Array<[string, SortDir]>;
  paging?: {
    length?: number;
    offset?: number;
  };
  access?: {
    only_public?: boolean;
    only_private?: boolean;
  };
  track_total_hits: boolean;
}

/**
 * The direct response from the SearchAPI2 service.
 * This is (probably) JSON-RPC 2.0 format.
 */
interface JSONRPCResponse {
  jsonrpc: '2.0';
  result: any;
  id: string;
}

export interface SearchResults {
  count: number;
  search_time: number;
  hits: Array<Doc>;
}

export const sorts: Record<string, string> = {
  '-updated': 'Recently updated',
  updated: 'Least recently updated',
  '-created': 'Recently created',
  created: 'Oldest',
};
export const sortsLookup = Object.fromEntries(
  Object.entries(sorts).map(([key, val]) => [val, key])
);

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
 * like tutorials and public narratives (and, later, for static narratives).
 * Authentication is required to search by owner. When an incorrect auth token
 * is given, regardless of data permissions, the search request will fail.
 *
 * This gets addressed in this function in the following way:
 *  1. if a user-based search (narratives owned by or shared by) is done, without a token available,
 *       this will throw an AuthError.
 *       (note that actually making the call without a token will just not
 *         return any results, this wraps that to make it obvious)
 *  2. if any search results in a 401 from the server (typically a present, but
 *       invalid, token), this also throws an AuthError.
 * @param {SearchOptions} SearchOptions
 * @return {Promise<SearchResults>}
 */
export default async function searchNarratives({
  term,
  category,
  sort,
  skip,
  pageSize,
}: SearchOptions): Promise<SearchResults> {
  const params: SearchParams = {
    types: ['KBaseNarrative.Narrative'],
    paging: {
      length: pageSize,
      offset: skip || 0,
    },
    track_total_hits: false,
  };
  if (term) {
    params.search = {
      query: term,
      fields: ['agg_fields'], // Search on all text fields
    };
  }
  params.filters = {
    operator: Operator.And,
    fields: [{ field: 'is_temporary', term: false }],
  };
  const username = Runtime.username();
  if (!username) return { count: 0, search_time: 0, hits: [] };
  switch (category) {
    case 'own':
      params.filters.fields.push({
        field: 'creator',
        term: username,
      });
      break;
    case 'shared':
      params.filters.fields.push({
        field: 'creator',
        not_term: username,
      });
      params.filters.fields.push({
        field: 'shared_users',
        term: username,
      });
      break;
    case 'public':
      params.access = { only_public: true };
      break;
    case 'tutorials':
      params.access = { only_public: true };
      params.filters.fields.push({ field: 'is_narratorial', term: true });
      break;
    default:
      throw new Error('Unknown search category');
  }

  params.sorts = [['_score', SortDir.Desc]];
  if (sort === 'Recently created') {
    params.sorts.unshift(['creation_date', SortDir.Desc]);
  } else if (sort === 'Oldest') {
    params.sorts.unshift(['creation_date', SortDir.Asc]);
  } else if (sort === 'Least recently updated') {
    params.sorts.unshift(['timestamp', SortDir.Asc]);
  } else if (sort === 'Recently updated') {
    params.sorts.unshift(['timestamp', SortDir.Desc]);
  } else {
    throw new Error('Unknown sorting method');
  }
  return await (await makeRequest(params)).result;
}

/**
 *
 * @param {SearchParams} params - this takes a query, number of documents to skip,
 *   sort parameter, auth (boolean, true if we're looking up personal data), and pageSize
 */
async function makeRequest(params: SearchParams): Promise<JSONRPCResponse> {
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
  };
  if (!params.access || !params.access.only_public) {
    // Requires an auth token
    const token = getToken();
    if (!token) {
      throw new Error(
        'Auth token not available for an authenticated search lookup!'
      );
    }
    headers.Authorization = token;
  }
  const result = await fetch(Runtime.getConfig().service_routes.search, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Number(new Date()),
      method: 'search_workspace',
      params,
    }),
  });
  if (!result.ok) {
    throw new Error('An error occurred while searching - ' + result.status);
  }
  return result.json();
}
