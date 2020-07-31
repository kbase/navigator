/**
 * @jest-environment jsdom
 */
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();
import {fetchNarrative, getCurrentUserPermission} from '../narrativeData';

describe('narrativeData tests', () => {
    const mockWSGetObjects2Ok = (narr: object) => {
        fetchMock.mockOnce(async (req) => {
            return JSON.stringify({
                id: '12345',
                version: '1.1',
                result: [narr]
            });
        });
    }

    const mockGetPermissionsMassOk = (perms: {[key: string]: string}) => {
        fetchMock.mockOnce(async (req) => {
            return JSON.stringify({
                id: '12345',
                version: '1.1',
                result: [{
                    perms: [perms]
                }]
            });
        });
    }

    it('Should return a narrative with the happy case', async () => {
        const dummyNarr = {
            data: {narr: 'obj'}
        };
        mockWSGetObjects2Ok(dummyNarr);
        const narrObj = await fetchNarrative('123/45/6');
        expect(narrObj).toEqual(dummyNarr);
    });

    it('Should return a set of user permissions with the happy case', async () => {
        const perms = {'some_user': 'a'};
        mockGetPermissionsMassOk(perms);
        const fetchedPerms = await getCurrentUserPermission(123);
        expect(fetchedPerms).toBe('a');
    });

    it('Should return a default of no access when user permissions are not defined', async () => {
        const perms = {'other_user': 'a', 'yet_another_user': 'w'};
        mockGetPermissionsMassOk(perms);
        const fetchedPerms = await getCurrentUserPermission(123);
        expect(fetchedPerms).toBe('n');
    });
});
