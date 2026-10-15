# AGENTS.md

## Operational Commands

- 패키지 매니저는 `bun` 고정 (`bun.lock` 존재). npm/yarn/pnpm 사용 금지.
- 설치: `bun install`
- 개발 (API 서버 + Vite 동시): `bun run dev`
- 테스트 전체: `bun run test` (`vitest run`). 단일 파일: `bunx vitest run server/fallback.test.ts`
- 타입체크 + 빌드: `bun run build` (`tsc -b && vite build`)
- 린트: `bun run lint`
- 주의: `bun test`는 Bun 자체 러너를 호출하므로 사용하지 않는다. 반드시 `bun run test`를 쓴다 (jsdom, setup 파일은 vitest 설정에 의존: `vite.config.ts:16-21`).

## Golden Rules

### Immutable

- API 키는 코드에 하드코딩하지 않는다. 서버는 `.env`(gitignore 대상, `.gitignore:32`)의 `ANTHROPIC_API_KEY`/`GOOGLE_API_KEY`만 읽는다 (`server/index.ts:59-62`).
- `.env` 값은 클라이언트로 내려보내지 않는다. `/api/config`는 키 존재 여부(boolean)만 반환한다 (`server/index.ts:147-157`). 키 자체를 응답에 포함하는 변경 금지.
- 사용자가 UI에 입력한 키는 React state에만 보관한다 (`src/App.tsx:14`). localStorage/sessionStorage에 저장하지 않는다 (`src` 내 사용처 없음).

### Hard Constraint

- 미리보기는 react-live `noInline` 모드이며 `render(<Component />)` 호출이 있어야 그려진다 (`src/components/LivePreview.tsx:14`, `server/generator.ts:13-14`). 생성 코드 후처리를 바꿀 때 이 호출 보장을 유지한다.
- AI가 생성하는 코드는 import 없이 전역 `React`를 쓰는 순수 JavaScript여야 한다 (`server/index.ts:11,20`). SYSTEM_PROMPT의 이 규칙을 완화하면 미리보기가 깨진다.
- 프론트엔드 `/api` 프록시 대상 포트는 3002이고 서버 포트와 일치해야 한다 (`vite.config.ts:11`, `server/index.ts:139`). 한쪽만 바꾸지 않는다.

### Asymmetry

- 폴백은 Google 경로에만 있다 (`server/index.ts:134-136`, 커밋 `a89cb31`). Anthropic은 단일 모델 호출이다 (`server/index.ts:77`). Anthropic에 폴백이 필요하면 `withModelFallback`을 재사용한다. 새로 구현하지 않는다.
- `finishReason === 'MAX_TOKENS'` 잘림 검사는 Gemini 경로에만 있다 (`server/index.ts:123`). 프로바이더를 추가하면 동등한 잘림 처리를 확인한다.

### Test Boundary

- 테스트가 있는 영역: `server/generator.ts`, `server/fallback.ts`, `src/components/PromptInput.tsx`. 순수 로직은 서버 파일에서 분리해 테스트한다. `server/index.ts`는 `Bun.serve` 부수효과로 import 시 서버가 뜨므로 테스트에서 import하지 않는다 (`server/generator.ts:1-2` 주석).
- 테스트가 없는 영역: `server/index.ts`(HTTP 핸들러, 에러 매핑), `src/hooks/useComponentGenerator.ts`, `LivePreview`, `CodeView`, `ComponentCard`. 이 파일을 수정하면 로직을 순수 함수로 분리하고 테스트를 추가한다.

### Double Defense

- 응답 정규화는 프롬프트와 후처리 두 겹이다. 프롬프트가 "코드펜스 금지, render 호출 포함"을 요구하고 (`server/index.ts:16,12`), 서버가 `stripCodeFences` + `ensureRenderCall`로 다시 보정한다 (`server/index.ts:188`). 한쪽이 있다고 다른 쪽을 제거하지 않는다.

### Do's and Don'ts

- Do: 서버 에러 메시지의 상태 코드 문자열 매칭(`includes('503')`, `includes('429')`, `server/index.ts:194,201`)에 의존하므로, 프로바이더 에러를 던질 때 `API error: <status>` 형식을 유지한다 (`server/index.ts:85,112`).
- Don't: `server/` 코드를 `tsc -b`가 검사해 준다고 가정하지 않는다. `tsconfig.app.json`은 `src`, `tsconfig.node.json`은 `vite.config.ts`만 포함하므로 `server/`는 타입체크 대상이 아니다. 서버 변경 시 타입 오류는 직접 확인한다.

## Project Context

React 컴포넌트를 프롬프트로 생성하고 react-live로 즉시 미리보기하는 도구. Tech Stack: React 19, TypeScript, Vite, Bun (API 프록시), react-live, Vitest + Testing Library.

## Standards and References

- 프로젝트 소개/실행 방법은 `README.md` 참조.
- 커밋 메시지: `type(scope): 한국어 요약` (feat/fix/refactor/chore, scope 선택). 예: `chore(skills): ...`, `feat: Google 모델 실패 시 자동 폴백 추가`.
- 주석과 UI 문구는 한국어, 서버 API 에러 메시지는 기존 파일의 혼용(영어/한국어)을 따른다.
- 에이전트 스킬은 `.claude/skills/`(Claude Code)와 `.agents/skills/`(Codex 공용, git 추적)에 있다. `.agents/`의 나머지는 gitignore 대상이다 (`.gitignore:34-36`).

## Maintenance Policy

이 문서의 규칙과 코드가 어긋나면(예: 폴백이 Anthropic에도 추가됨, 포트 변경) 작업 중 발견 즉시 AGENTS.md 업데이트를 제안한다.
