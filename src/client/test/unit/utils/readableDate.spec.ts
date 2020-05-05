import { readableISODate } from '../../../utils/readableDate';

test('does the readable date thing', () => {
    expect(readableISODate("2020-05-01T20:56:05+0000")).toBe("5/1/2020");
});
