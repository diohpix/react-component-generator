import type { GeneratedComponent } from '../types';

export const HISTORY_MAX = 10;

/** localStorage에서 JSON 값을 읽는다. 키가 없거나 파싱/접근에 실패하면 fallback을 반환한다. */
export function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** localStorage에 JSON 값을 저장한다. 용량 초과·접근 차단 시 조용히 무시한다. */
export function saveStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 앱 동작에 영향을 주지 않는다.
  }
}

/** 최신 프롬프트를 맨 앞에 두고, 중복은 제거하며, 최대 HISTORY_MAX개로 자른다. */
export function addToHistory(history: string[], prompt: string): string[] {
  return [prompt, ...history.filter((p) => p !== prompt)].slice(0, HISTORY_MAX);
}

/** 저장된 JSON을 GeneratedComponent[]로 복원한다. createdAt은 Date로 되돌리고 잘못된 항목은 버린다. */
export function reviveComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.id !== 'string' ||
      typeof item.prompt !== 'string' ||
      typeof item.code !== 'string'
    ) {
      return [];
    }
    const createdAt = new Date(item.createdAt);
    if (Number.isNaN(createdAt.getTime())) return [];
    return [{ id: item.id, prompt: item.prompt, code: item.code, createdAt }];
  });
}
