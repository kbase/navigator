import { sortBy } from '../../../src/client/utils/sortBy';

test('sortBy should work for a simple number array', () => {
    const disordered = [ 3, 2, 1, 4, 6, 5 ];
    const ordered = [ 1, 2, 3, 4, 5, 6 ];
    expect(sortBy(disordered, v => v)).toEqual(ordered);
});
