import { KBaseServiceClient } from '@kbase/narrative-utils';
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

export function fetchNarrative(upa: string) {
  const client = new KBaseServiceClient({
    module: 'Workspace',
    url: Runtime.getConfig().service_routes.workspace,
    authToken: Runtime.token(),
  });
  return client.call('get_objects2', [{ objects: [{ ref: upa }] }]);
}

/**
 * Returns the current user's permissions for some narrative. This is either 'a', 'w', 'r', or 'n';
 * @param wsId workspace id for a narrative of interest
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
