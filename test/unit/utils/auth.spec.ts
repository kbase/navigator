/**
 * @jest-environment jsdom
 */

import { getToken, getUsername } from '../../../src/client/utils/auth';

describe('getToken tests', () => {
    const token = 'someAuthToken';
    beforeEach(() => {
        document.cookie=`kbase_session=${token}`;
    });

    test('getToken should retrieve token', () => {
        expect(getToken()).toEqual(token);
    });

    test('getToken should return undefined if no cookie is set', () => {
        document.cookie='kbase_session=';
        expect(getToken()).toEqual('');
    });
});

describe('getUsername tests', () => {
    // do some mocking?

});
