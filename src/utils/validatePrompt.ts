export const PROMPT_MAX_LENGTH = 500;

export interface PromptValidation {
  valid: boolean;
  length: number;
  error?: string;
}

/** 프롬프트 길이를 검증한다. 제출 시 trim되므로 앞뒤 공백은 길이에서 제외한다. */
export function validatePromptLength(prompt: string): PromptValidation {
  const length = prompt.trim().length;
  if (length > PROMPT_MAX_LENGTH) {
    return {
      valid: false,
      length,
      error: `프롬프트는 ${PROMPT_MAX_LENGTH}자 이하로 입력해주세요.`,
    };
  }
  return { valid: true, length };
}
