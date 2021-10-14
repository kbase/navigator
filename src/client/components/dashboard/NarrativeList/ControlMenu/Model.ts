import { linkNarrativeToOrg, OrgAPIError } from '../../../../utils/orgInfo';
import { AuthInfo } from '../../../Auth';

/**
 * Holds the state for the overall Link Organizations item popup.
 */
export type LinkOrgResult = 'requested' | 'completed';

export default class Model {
  narrativeId: number;
  authInfo: AuthInfo;
  constructor(authInfo: AuthInfo, narrativeId: number) {
    this.narrativeId = narrativeId;
    this.authInfo = authInfo;
  }
  async linkOrg(orgId: string): Promise<LinkOrgResult> {
    try {
      const request = await linkNarrativeToOrg(
        this.authInfo,
        this.narrativeId,
        orgId
      );
      if (request.complete) {
        return 'completed';
      }
      return 'requested';
    } catch (error) {
      if (error instanceof OrgAPIError) {
        const errJson = await (async () => {
          try {
            return await error.response.json();
          } catch (err) {
            throw error;
          }
        })();
        if (errJson.error) {
          switch (errJson.error.appcode) {
            case 40010:
              throw new Error(
                'A request has already been made to add this Narrative to this Organization. '
              );
            default:
              throw new Error(
                `An error (${errJson.error.appcode}) was made while processing your request.`
              );
          }
        }
      }
      throw new Error('An error was made while processing your request');
    }
  }
}
