/**
 * @jest-environment jsdom
 */
import { enableFetchMocks } from 'jest-fetch-mock';
import { fetchProfileAPI } from '../../../src/client/utils/userInfo';
jest.mock('../../../src/client/api/serviceWizard');
enableFetchMocks();

describe('fetchProfile tests', () => {
    const token = 'someAuthToken',
        userId = 'someuser',
        userName = 'Some User';

    beforeEach(() => {
        document.cookie=`kbase_session=${token}`;
    });

    test('fetchProfile should return profile', async () => {
        new RegExp(`/fetchUserProfile\/${userId}/`)

        fetchMock.mockIf('https://env.kbase.us/services/some_special_url/fetchUserProfile/someuser', async (req) => {
            return JSON.stringify({
                user: {
                    username: userId,
                    realname: userName
                },
                profile: {
                    "metadata": {"created": "2015-01-14T00:32:40.885Z"},
                    "userdata": {
                        "researchStatement": "KBase!",
                        "jobTitle": "Person",
                        "affiliations": [{
                            "organization": "Lawrence Berkeley National Laboratory",
                            "started": 2012,
                            "title": "Software Developer",
                            "ended": "Present"
                        }],
                        "state": "California",
                        "country": "United States",
                        "city": "Oakland",
                        "postalCode": "",
                        "fundingSource": "",
                        "gravatarDefault": "identicon",
                        "avatarOption": ""
                    },
                    "synced": {
                        "gravatarHash": "294da295adeac456edf84b40d8e714d6"
                    },
                    "preferences": {}
                }
            })
        });
        const profile = await fetchProfileAPI(userId);
        expect(profile).toBeDefined();
        expect(profile.user.username).toEqual(userId);
        expect(profile.user.realname).toEqual(userName);
    });

    test('fetchProfile should fail without a token', async () => {
        document.cookie=`kbase_session=`;
        await expect(() => fetchProfileAPI(userId)).rejects.toThrow();
    });
});
