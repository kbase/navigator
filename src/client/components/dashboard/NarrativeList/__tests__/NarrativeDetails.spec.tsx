/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import { enableFetchMocks } from 'jest-fetch-mock';
import { NarrativeDetails } from '../NarrativeDetails';

enableFetchMocks();

const mockDoc = {
  access_group: 12345,
  copied: false,
  cells: [],
  creation_date: '2020-07-17T22:04:00+0000',
  creator: 'owner',
  data_objects: [],
  is_public: false,
  is_narratorial: false,
  is_temporary: false,
  narrative_title: 'Narrative title',
  modified_at: 1595023480707,
  obj_id: 1,
  obj_name: `Narrative title`,
  obj_type_module: 'KBaseNarrative',
  obj_type_name: 'Narrative',
  obj_type_version: '4.0',
  owner: 'owner',
  shared_users: ['owner'],
  tags: ['narrative'],
  timestamp: 1595023480707,
  total_cells: 1,
  version: 1,
};

describe('NarrativeDetails tests', () => {
  test('NarrativeDetails renders', () => {
    const ownerProfile = JSON.stringify({
      id: '12345',
      version: '1.1',
      result: [
        [
          {
            user: {
              username: 'owner',
              realname: 'Owner',
            },
          },
        ],
      ],
    });
    fetchMock.mockResponses(
      [ownerProfile, { status: 200 }],
      [ownerProfile, { status: 200 }]
    );
    const wrapper = shallow(
      <NarrativeDetails
        activeItem={mockDoc}
        cache={{}}
        updateSearch={() => {}}
        view={'preview'}
        previousVersion={null}
        category={''}
        loading={false}
      />
    );
    expect(wrapper).toBeTruthy();
    expect(wrapper.find('div')).toBeTruthy();
  });
});
