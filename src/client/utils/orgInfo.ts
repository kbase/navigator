import Runtime from './runtime';

export interface GroupInfo {
  id: string;
  owner: string; // user id
  name: string;
  role: string;
  private: boolean;
}

export interface GroupIdentity {
  id: string;
  name: string;
}

/**
 * Returns the group info for all groups that have the given workspace (i.e. Narrative)
 * as one of its resources.
 * Further, this only returns the set of groups for which the current user is a member / has
 * view access.
 * @param {number} wsId - a workspace id
 */
export async function getLinkedOrgs(wsId: number): Promise<Array<GroupInfo>> {
  return makeOrgsCall(`group?resourcetype=workspace&resource=${wsId}`, 'GET');
}

/**
 * Returns the list of all orgs to which the current user is a member.
 */
export async function lookupUserOrgs(): Promise<Array<GroupIdentity>> {
  const orgs = await makeOrgsCall('member', 'GET');
  return orgs.sort((a: GroupIdentity, b: GroupIdentity) => {
    return a.name.localeCompare(b.name);
  });
}

/**
 * This attempts to link a workspace (and narrative) to an org.
 * If the user is an org admin, and a resource owner, this happens automatically and returns null.
 * If the user is not an org admin, but is a resource owner, this creates a request to the org.
 * If the user it neither an admin of the org or the resource, this throws an error.
 * @param {number} wsId - a workspace id to link to the org
 * @param {string} orgId - the id of the org to link
 */
interface AddResourceStatus {
  complete: boolean;
}

interface GroupsRequest {
  id: string;
  groupid: string;
  requester: string;
  type: string;
  resourcetype: string;
  resource: string;
  status: string;
  createdate: number;
  expiredate: number;
  moddate: number;
}

export async function linkNarrativeToOrg(
  wsId: number,
  orgId: string
): Promise<GroupsRequest & AddResourceStatus> {
  const call = `group/${orgId}/resource/workspace/${wsId}`;
  return makeOrgsCall(call, 'POST');
}

export class OrgAPIError extends Error {
  public response: any;
  constructor(m: string, response: Response) {
    super(m);
    this.response = response;
  }
}

/**
 * Call the REST interface to the Groups service. Takes a call (without a leading slash)
 * and REST method (GET, POST, etc.)
 * E.g. makeOrgsCall("member", "GET") will make a GET request to
 * <env>.kbase.us/services/groups/member
 * with the current auth token as the Authorization header.
 * @param {string} call - string, the command to send
 * @param {string} method - one of GET, POST, PUT, DELETE
 */
async function makeOrgsCall(call: string, method: string): Promise<any> {
  const groupsUrl = Runtime.getConfig().service_routes.groups;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: Runtime.token(),
  };
  return fetch(groupsUrl + '/' + call, {
    headers,
    method: method,
  })
    .then((res) => {
      if (!res.ok) {
        throw new OrgAPIError(res.statusText, res);
      }
      return res;
    })
    .then((res) => res.json());
}
