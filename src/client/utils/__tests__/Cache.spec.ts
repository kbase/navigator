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

  test('Cache entry should not exist after it has expired', (done) => {
    const cache = new Cache<string>(100);
    cache.set('foo', 'bar');
    expect(cache.has('foo')).toBe(true);
    window.setTimeout(() => {
      expect(cache.has('foo')).toBe(false);
      done();
    }, 1000);
  });

  test('Cache entry should exist after it has not expired', (done) => {
    const cache = new Cache<string>(1000);
    cache.set('foo', 'bar');
    expect(cache.has('foo')).toBe(true);
    window.setTimeout(() => {
      expect(cache.has('foo')).toBe(true);
      done();
    }, 100);
  });

  test('Attempting to get a non-existent entry should throw', () => {
    const cache = new Cache<string>();
    expect(() => {
      cache.get('foo');
    }).toThrow();
  });

  test('Caching with a ttl of 1ms or greater should succeed with immediate fetch', () => {
    // this is not deterministic, but on modern cpus 
    // should be a safe assumptiono
    const cache = new Cache<string>();

    for (let i = 0; i > 100; i += 1) {
      const cache = new Cache<string>(i);
      cache.set('foo', 'bar');
      expect(cache.has('foo')).toBe(true);
    }
  });

  test('Caching with a ttl of 0 or less should always fail with immediate fetch', () => {
    const cache = new Cache<string>();
    for (let i = -1; i > -100; i -= 1) {
      const cache = new Cache<string>(i);
      cache.set('foo', 'bar');
      expect(cache.has('foo')).toBe(false);
    }
  });
});
