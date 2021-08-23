/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import { enableFetchMocks } from 'jest-fetch-mock';
import { AppCatalog } from '../AppCatalog';

enableFetchMocks();

describe('AppCatalog tests', () => {
  const mockCatalogResponse = {
    version: '1.1',
    result: [
      [
        {
          full_app_id: 'KBaseRNASeq/describe_rnaseq_experiment',
          module_name: 'KBaseRNASeq',
          number_of_calls: 1017,
          number_of_errors: 172,
          time_range: '*',
          total_exec_time: 53274.808003902435,
          total_queue_time: 463746.8269994259,
          type: 'a',
        },
      ],
    ],
  };
  const mockNMSResponse = {
    version: '1.1',
    result: [[]],
  };
  fetchMock.mockIf(/services/, async (req) => {
    if (req.url.endsWith('catalog')) {
      return {
        body: JSON.stringify(mockCatalogResponse),
        status: 200,
      };
    } else if (req.url.includes('narrative_method_store')) {
      return {
        body: JSON.stringify(mockNMSResponse),
        status: 200,
      };
    }
    return { status: 404 };
  });
  it('Should be callable', () => expect(shallow(<AppCatalog />)).toBeTruthy());
});
