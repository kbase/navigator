import { sortBy } from '../../../src/client/utils/sortBy';

test('sortBy should work for a simple number array', () => {
  const disordered = [3, 2, 1, 4, 6, 5];
  const ordered = [1, 2, 3, 4, 5, 6];
  expect(sortBy(disordered, v => v)).toEqual(ordered);
});

test('sortBy should not alter a flat number array', () => {
  const arr = [1, 1, 1, 1, 1, 1];
  expect(sortBy(arr, v => v)).toEqual(arr);
});

test('sortBy should work against a complex object array', () => {
  const objArr = [{ a: { b: 1 } }, { a: { b: -5 } }, { a: { b: 2 } }];
  const sorted = [{ a: { b: -5 } }, { a: { b: 1 } }, { a: { b: 2 } }];

  expect(sortBy(objArr, v => v.a.b)).toEqual(sorted);
});
