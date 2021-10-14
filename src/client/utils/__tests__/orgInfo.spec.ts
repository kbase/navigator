/**
 * @jest-environment jsdom
 */
import { enableFetchMocks } from 'jest-fetch-mock';
import { AuthInfo } from '../../components/Auth';
enableFetchMocks();
import {
  getLinkedOrgs,
  lookupUserOrgs,
  linkNarrativeToOrg,
  OrgAPIError,
} from '../orgInfo';

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
    user: 'foo',
  },
};

describe('Organizations API testing', () => {
  const authToken = 'someToken';
  beforeEach(() => {
    document.cookie = `kbase_session=${authToken}`;
  });

  it('getLinkedOrgs should fail without an auth token', async () => {
    document.cookie = `kbase_session=`;
    await expect(() => getLinkedOrgs(authInfo, 123)).rejects.toThrow();
  });

  it('getLinkedOrgs should fail with a bad workspace id', async () => {
    fetchMock.mockOnce(async (req) => {
      return {
        body: JSON.stringify({
          error: {
            httpcode: 500,
            httpstatus: 'Internal Server Error',
            message:
              'Error contacting workspace at https://kbase.us/services/ws',
            callid: '123',
            time: 1595032219199,
          },
        }),
        status: 500,
      };
    });
    await expect(() => getLinkedOrgs(authInfo, 123)).rejects.toThrow();
  });

  it('getLinkedOrgs should return the linked organizations for a valid workspace id', async () => {
    const groupInfos = [
      {
        id: 'group1',
        owner: 'someuser',
        name: 'Some Group',
        role: 'member',
        private: true,
      },
    ];
    fetchMock.mockOnce(async (req) => {
      return JSON.stringify(groupInfos);
    });
    const linkedOrgs = await getLinkedOrgs(authInfo, 123);
    expect(linkedOrgs).toEqual(groupInfos);
  });

  it('lookupUserOrgs should fail without an auth token', async () => {
    document.cookie = `kbase_session=`;
    await expect(() => lookupUserOrgs(authInfo)).rejects.toThrow();
  });

  it('lookupUserOrgs should list user organization id and name', async () => {
    const groupIds = [
      {
        id: 'group1',
        name: 'Group One',
      },
      {
        id: 'group2',
        name: 'Group Two',
      },
    ];
    fetchMock.mockOnce(async (req) => {
      return JSON.stringify(groupIds);
    });
    const linkedOrgs = await lookupUserOrgs(authInfo);
    expect(linkedOrgs).toEqual(groupIds);
  });

  it('linkNarrativeToOrg should fail without an auth token', async () => {
    document.cookie = `kbase_session=`;
    await expect(() =>
      linkNarrativeToOrg(authInfo, 123, 'someOrg')
    ).rejects.toThrow();
  });

  it('linkNarrativeToOrg should return "complete" if the user is an org admin', async () => {
    fetchMock.mockOnce(async (req) => JSON.stringify({ complete: true }));
    const res = await linkNarrativeToOrg(authInfo, 123, 'someOrg');
    expect(res).toEqual({ complete: true });
  });

  it('linkNarrativeToOrg should return an error if a request has already been sent', async () => {
    fetchMock.mockOnce(async (req) => {
      return {
        body: JSON.stringify({
          error: {
            httpcode: 400,
            httpstatus: 'Bad Request',
            appcode: 40010,
            apperror: 'Request already exists',
            message:
              '40010 Request already exists: Request exists with ID: SOME-ID',
            callid: 'somecallid',
            time: 1595030863696,
          },
        }),
        status: 400,
      };
    });
    try {
      await linkNarrativeToOrg(authInfo, 123, 'someOrg');
    } catch (error) {
      expect(error).toBeInstanceOf(OrgAPIError);
      if (error instanceof OrgAPIError) {
        const res = await error.response.json();
        expect(res.error.appcode).toEqual(40010);
      } else {
        fail('Expected error to be an OrgAPIError');
      }
    }
  });
});
