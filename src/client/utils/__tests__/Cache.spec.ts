/**
 * @jest-environment jsdom
 */

import Cache from '../Cache';

describe('Cache tests', () => {

  beforeEach(() => {
  });

  test('Creates a minimal cache which should succeed', () => {
    const cache = new Cache<string>();
    expect(cache).toBeDefined();
  });


  test('Clear cache before setting anything, cache should be empty', () => {
    const cache = new Cache<string>();
    expect(cache.size()).toEqual(0);
  });

  test('Set a value, get it back, should be identical, have only one item', () => {
    const cache = new Cache<string>();
    cache.set('foo', 'bar');
    expect(cache.get('foo')).toEqual('bar');
    expect(cache.size()).toEqual(1);
  });

  test('Initial cache should be empty', () => {
    const cache = new Cache<string>();
    expect(cache.size()).toEqual(0);
  });

  test('Set a value, remove it, cache should be empty', () => {
    const cache = new Cache<string>();
    cache.remove('foo');
    expect(cache.size()).toEqual(0);
  });

  test('Set a value, clear it, cache should be empty', () => {
    const cache = new Cache<string>();
    cache.set('foo', 'bar');
    expect(cache.size()).toEqual(1);
    cache.remove('foo');
    expect(cache.size()).toEqual(0);
  });


  test('Delete from cache before setting anything, cache should be empty', () => {
    const cache = new Cache<string>();
    cache.remove('foo');
    expect(cache.size()).toEqual(0);
  });

});
