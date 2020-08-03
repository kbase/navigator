/**
 * @jest-environment jsdom
 */

// This isn't really used anywhere, so it just tests the happy path for now.

import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();
import { fetchApps } from '../fetchApps';
import Runtime from '../runtime';

describe('fetchApps tests', () => {
  beforeEach(() => {});

  const mockCatalogGetStatsOk = () => {
    fetchMock.doMockIf(
      Runtime.getConfig().service_routes.catalog,
      async req => {
        return JSON.stringify({
          id: '12345',
          version: '1.1',
          result: [
            [
              {
                full_app_id: 'SomeModule/some_app',
                time_range: '*',
                type: 'a',
                number_of_calls: 106,
                number_of_errors: 5,
                module_name: 'SomeModule',
                total_queue_time: 857,
                total_exec_time: 6091,
              },
            ],
          ],
        });
      }
    );
  };

  const mockNMSListMethodsOk = () => {
    fetchMock.doMockIf(
      Runtime.getConfig().service_routes.narrative_method_store + '/rpc',
      async req => {
        return JSON.stringify({
          id: '67890',
          version: '1.1',
          result: [
            [
              {
                id: 'SomeModule/some_app',
                module_name: 'SomeModule',
                git_commit_hash: 'abcdefgh',
                name: 'SOME APP',
                ver: '1.0.0',
                categories: ['apps'],
              },
            ],
          ],
        });
      }
    );
  };

  afterEach(() => {});

  test('fetchApps should be a function', () => {
    expect(fetchApps).toBeDefined();
  });

  test('fetchApps should work in happy case', async () => {
    mockCatalogGetStatsOk();
    mockNMSListMethodsOk();
    const appInfos = await fetchApps();
    expect(appInfos.runs).toBeDefined();
    expect(appInfos.details).toBeDefined();
    expect(appInfos.categories).toEqual(['apps']);
  });
});
