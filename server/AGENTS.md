# server/AGENTS.md

## Module Context

Bun 런타임에서 동작하는 AI API 프록시 (`Bun.serve`, 포트 3002). Vite 프론트엔드가 `/api`로 프록시한다. 루트 AGENTS.md 규칙이 그대로 적용된다.

## Tech Stack and Constraints

- 외부 SDK 없이 `fetch`로 Anthropic/Gemini REST를 직접 호출한다 (`index.ts:69,101`). 새 프로바이더도 동일하게 `fetch`를 쓰고 의존성을 추가하지 않는다.
- 실행은 `bun --watch run server/index.ts` (`bun run server`). Node에서 실행하지 않는다 (`Bun.serve`, `process.env` 직접 사용).

## Implementation Patterns

- 부수효과가 없는 로직은 `generator.ts`, `fallback.ts`처럼 별도 파일의 순수 함수로 두고 `index.ts`에서 import한다. `index.ts`는 import 즉시 서버를 띄운다 (`index.ts:138`).
- 모델 목록은 `GOOGLE_MODELS` 배열(`index.ts:5`)에 우선순위 순으로 둔다. 폴백은 `withModelFallback`이 담당한다.
- 모든 응답에 `CORS_HEADERS`를 붙인다 (`index.ts:51-55`, 404 포함). 새 엔드포인트도 동일하게 적용한다.

## Testing Strategy

- 테스트 파일은 소스 옆에 `*.test.ts`로 둔다. `vite.config.ts:20`의 `server/**/*.test.ts` 패턴에 맞아야 실행된다.
- 실행: `bunx vitest run server`
- 새 로직은 `index.ts`에 직접 쓰지 말고 순수 함수로 추출해 테스트한다. 기존 패턴: `generator.test.ts`, `fallback.test.ts`(`vi.fn`으로 attempt 모킹).

## Local Golden Rules

- Don't: 프로바이더 API 키를 로그/에러 메시지에 포함하지 않는다. Gemini는 키가 URL 쿼리에 들어가므로 (`index.ts:99`) 요청 URL을 로깅하거나 에러에 넣지 않는다.
- Don't: `withModelFallback`의 전체 실패 시 마지막 에러를 던지는 동작(`fallback.ts:19`)을 바꾸지 않는다. 핸들러의 503/429 매핑이 이 에러 메시지에 의존한다 (`index.ts:194-206`).
- Do: 에러 메시지를 던질 때 `Claude API error: <status>` / `Gemini API error: <status>` 형식을 유지한다 (`index.ts:85,112`).
- Do: 사용자 키 우선, 없으면 환경변수 순서를 유지한다 (`resolveApiKey`, `index.ts:64-66`).
