/* eslint-disable camelcase */
import { KBaseServiceClient } from '@kbase/narrative-utils';
import { DynamicServiceClient } from '../api/serviceWizard';
import Runtime from '../utils/runtime';

/**
 * Interfaces that represent Narrative data returned from the search service.
 */

/**
 * The Cell is the unitary piece of a Narrative where info gets stored and apps get run.
 */
export interface Cell {
  desc: string;
  cell_type: string;
  count?: number;
}

export interface DataObject {
  name: string;
  obj_type: string;
  readableType: string;
}

/**
 * A Doc is composed of an Array of Cells and a bunch of extra info and data.
 * This pretty closely matches what's returned from Search.
 */
export interface Doc {
  access_group: number;
  cells: Array<Cell>;
  copied: boolean | null;
  creation_date: string;
  creator: string;
  data_objects: Array<DataObject>;
  is_narratorial: boolean;
  is_public: boolean;
  is_temporary: boolean;
  modified_at: number;
  narrative_title: string;
  obj_id: number;
  obj_name: string;
  obj_type_module: string;
  obj_type_version: string;
  owner: string;
  shared_users: Array<string>;
  tags: Array<string>;
  timestamp: number;
  total_cells: number;
  version: number;
}

/**
 * The KBaseCache interface
 */
export interface KBaseCache {
  [key: string]: any;
}

export async function fetchNarrative(upa: string, cache: KBaseCache = {}) {
  if (upa in cache) {
    return { data: [{ data: cache[upa] }] };
  }
  const client = new KBaseServiceClient({
    module: 'Workspace',
    url: Runtime.getConfig().service_routes.workspace,
    authToken: Runtime.token(),
  });
  const response = await client.call('get_objects2', [
    { objects: [{ ref: upa }] },
  ]);
  const itemUpdate = response.data[0].data;
  cache[upa] = itemUpdate;
  return response;
}

/**
 * Returns the current user's permissions for some narrative. This is either 'a', 'w', 'r', or 'n';
 * @param {number} wsId workspace id for a narrative of interest
 */
export async function getCurrentUserPermission(wsId: number): Promise<string> {
  const client = new KBaseServiceClient({
    module: 'Workspace',
    url: Runtime.getConfig().service_routes.workspace,
    authToken: Runtime.token(),
  });

  let perms = await client.call('get_permissions_mass', [
    { workspaces: [{ id: wsId }] },
  ]);
  perms = perms.perms[0];
  const user = Runtime.username();
  if (user && user in perms) {
    return perms[user];
  }
  return 'n';
}

export async function fetchOldVersionDoc(
  id: number,
  obj: number,
  ver: number
): Promise<Doc> {
  const client = new DynamicServiceClient({
    moduleName: "NarrativeService",
    authToken: Runtime.token(),
    wizardUrl: Runtime.getConfig().service_routes.service_wizard,
    version: 'dev'
  });

  return client.call('get_narrative_doc', [
    {narrative_upa: `${id}/${obj}/${ver}`}
  ]);
}
