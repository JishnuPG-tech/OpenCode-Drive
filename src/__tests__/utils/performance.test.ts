import { debounce, throttle, memoize, batchUpdates } from '../../utils/performance';

describe('Performance Utilities', () => {
  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call function after wait period', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 200);

      debounced('arg1', 'arg2');
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(200);
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous call when invoked again', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 200);

      debounced('first');
      jest.advanceTimersByTime(100);

      debounced('second');
      jest.advanceTimersByTime(100);
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('second');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid successive calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced('a');
      debounced('b');
      debounced('c');

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('c');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call function immediately', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 200);

      throttled('test');
      expect(fn).toHaveBeenCalledWith('test');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not call again within limit', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 200);

      throttled('first');
      throttled('second');
      expect(fn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(200);
      throttled('third');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should allow call after limit expires', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled('first');
      jest.advanceTimersByTime(100);
      throttled('second');
      jest.advanceTimersByTime(100);
      throttled('third');

      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('memoize', () => {
    it('should return cached result for same args', () => {
      const fn = jest.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn);

      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call function for different args', () => {
      const fn = jest.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn);

      memoized(1, 2);
      memoized(3, 4);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use custom key function', () => {
      const fn = jest.fn((obj: { id: number }) => obj.id);
      const memoized = memoize(fn, (obj) => obj.id.toString());

      const obj1 = { id: 1 };
      const obj2 = { id: 1 };
      expect(memoized(obj1)).toBe(1);
      expect(memoized(obj2)).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should use JSON.stringify by default', () => {
      const fn = jest.fn((a: number, b: number) => a + b);
      const memoized = memoize(fn);

      memoized(1, 2);
      memoized(1, 2);
      memoized(2, 1);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('batchUpdates', () => {
    it('should execute all update functions', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      const fn3 = jest.fn();

      batchUpdates([fn1, fn2, fn3]);
      expect(fn1).toHaveBeenCalled();
      expect(fn2).toHaveBeenCalled();
      expect(fn3).toHaveBeenCalled();
    });

    it('should execute updates in order', () => {
      const order: number[] = [];
      batchUpdates([
        () => order.push(1),
        () => order.push(2),
        () => order.push(3),
      ]);
      expect(order).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
      expect(() => batchUpdates([])).not.toThrow();
    });
  });
});
