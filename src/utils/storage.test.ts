import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addToHistory,
  HISTORY_MAX,
  loadStored,
  reviveComponents,
  saveStored,
} from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('loadStored / saveStored', () => {
  it('저장한 값을 다시 읽어온다', () => {
    saveStored('k', { a: 1 });
    expect(loadStored('k', null)).toEqual({ a: 1 });
  });

  it('키가 없으면 fallback을 반환한다', () => {
    expect(loadStored('missing', 'fb')).toBe('fb');
  });

  it('JSON이 깨져 있으면 fallback을 반환한다', () => {
    localStorage.setItem('k', '{broken');
    expect(loadStored('k', 'fb')).toBe('fb');
  });

  it('저장소 쓰기가 실패해도 예외를 던지지 않는다', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => saveStored('k', 1)).not.toThrow();
    spy.mockRestore();
  });
});

describe('addToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addToHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('중복 프롬프트는 맨 앞으로 이동시킨다', () => {
    expect(addToHistory(['a', 'b'], 'b')).toEqual(['b', 'a']);
  });

  it(`최대 ${HISTORY_MAX}개까지만 유지한다`, () => {
    const full = Array.from({ length: HISTORY_MAX }, (_, i) => `p${i}`);
    const next = addToHistory(full, 'new');
    expect(next).toHaveLength(HISTORY_MAX);
    expect(next[0]).toBe('new');
  });
});

describe('reviveComponents', () => {
  it('createdAt 문자열을 Date로 복원한다', () => {
    const iso = '2026-01-01T00:00:00.000Z';
    const [c] = reviveComponents([{ id: '1', prompt: 'p', code: 'c', createdAt: iso }]);
    expect(c.createdAt).toBeInstanceOf(Date);
    expect(c.createdAt.toISOString()).toBe(iso);
  });

  it('형식이 잘못된 항목은 걸러낸다', () => {
    const result = reviveComponents([
      { id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 2 },
      null,
    ]);
    expect(result).toHaveLength(1);
  });

  it('배열이 아니면 빈 배열을 반환한다', () => {
    expect(reviveComponents('oops')).toEqual([]);
  });
});
