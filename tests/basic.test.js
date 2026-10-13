import { describe, it, expect } from 'vitest';

describe('Basic Test', () => {
  it('should add numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should concatenate strings', () => {
    expect('hello ' + 'world').toBe('hello world');
  });

  it('should work with arrays', () => {
    expect([1, 2, 3].length).toBe(3);
  });
});
