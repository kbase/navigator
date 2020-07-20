/**
 * @jest-environment jsdom
 */

import { readableDate } from '../../../src/client/utils/readableDate';

const happyCases = [
  ['2020-05-01T20:56:05+0000', '5/1/2020'],
  ['0', '1/1/2000'],
  [1588695489876, '5/5/2020'],
];

const errorCases = ['', 'notADate'];

test('readable date against happy cases', () => {
  for (let i = 0; i < happyCases.length; i++) {
    const testCase = happyCases[i];
    expect(readableDate(testCase[0])).toEqual(testCase[1]);
  }
});

test('readable date should return "Invalid Date" for invalid cases', () => {
  for (let i = 0; i < errorCases.length; i++) {
    expect(readableDate(errorCases[i])).toEqual('Invalid Date');
  }
});
