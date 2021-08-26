/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import { enableFetchMocks } from 'jest-fetch-mock';

import OrgSelect from '../OrgSelect';

enableFetchMocks();

describe('OrgSelect', () => {
  it('should render empty orgs', () => {
    const props = {
      linkOrg: (orgId: string) => {
        return;
      },
      orgs: [],
    };
    expect(shallow(<OrgSelect {...props} />)).toBeTruthy();
  });
});
