/**
 * Cache Utility Tests
 */

import { apiCache, imageCache, CacheManager } from '../../utils/cache';

describe('Cache Manager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager(5);
    cache.clear();
  });

  describe('Basic Operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should delete values', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      expect(cache.get('key1')).toBeNull();
    });

    it('should clear all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should return cache size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });
  });

  describe('TTL Expiration', () => {
    it('should expire entries after TTL', () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      expect(cache.get('key1')).toBe('value1');

      // Wait for expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(cache.get('key1')).toBeNull();
          resolve(undefined);
        }, 150);
      });
    });

    it('should not expire entries before TTL', () => {
      cache.set('key1', 'value1', 1000); // 1 second TTL
      expect(cache.get('key1')).toBe('value1');
    });
  });

  describe('Max Size', () => {
    it('should evict oldest entries when max size is reached', () => {
      const testCache = new CacheManager(3);

      testCache.set('key1', 'value1');
      testCache.set('key2', 'value2');
      testCache.set('key3', 'value3');
      testCache.set('key4', 'value4'); // Should evict key1

      expect(testCache.get('key1')).toBeNull();
      expect(testCache.get('key2')).toBe('value2');
      expect(testCache.get('key3')).toBe('value3');
      expect(testCache.get('key4')).toBe('value4');
    });
  });

  describe('Object Values', () => {
    it('should store and retrieve objects', () => {
      const obj = { name: 'test', value: 123 };
      cache.set('obj', obj);
      expect(cache.get('obj')).toEqual(obj);
    });

    it('should store and retrieve arrays', () => {
      const arr = [1, 2, 3, 'test'];
      cache.set('arr', arr);
      expect(cache.get('arr')).toEqual(arr);
    });
  });
});

describe('API Cache', () => {
  beforeEach(() => {
    apiCache.clear();
  });

  it('should store sessions', () => {
    const sessions = [{ id: '1', title: 'Test' }];
    apiCache.set('sessions', sessions, 60000);
    expect(apiCache.get('sessions')).toEqual(sessions);
  });

  it('should store models', () => {
    const models = [{ id: '1', name: 'Model 1' }];
    apiCache.set('models', models, 300000);
    expect(apiCache.get('models')).toEqual(models);
  });
});

describe('Image Cache', () => {
  beforeEach(() => {
    imageCache.clear();
  });

  it('should store image URLs', () => {
    imageCache.set('image1', 'https://example.com/image.jpg');
    expect(imageCache.get('image1')).toBe('https://example.com/image.jpg');
  });

  it('should store multiple images', () => {
    imageCache.set('image1', 'https://example.com/image1.jpg');
    imageCache.set('image2', 'https://example.com/image2.jpg');
    imageCache.set('image3', 'https://example.com/image3.jpg');

    expect(imageCache.size()).toBe(3);
  });
});
