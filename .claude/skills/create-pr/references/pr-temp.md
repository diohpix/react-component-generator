# PR 템플릿

프로젝트 언어에 맞는 섹션 하나만 사용한다. 섹션 제목과 순서는 그대로 유지하고, 해당 사항이 없는 항목은 지우지 말고 "해당 없음"(KR) / "N/A"(EN)로 둔다. `<...>`와 HTML 주석은 실제 내용으로 바꾸고 남기지 않는다.

- 언어 선택 기준: 최근 커밋 메시지와 README가 한국어면 KR, 그 외에는 EN
- 제목 형식: `type(scope): 요약` (70자 이내)

---

## KR

```markdown
## 개요

<이 PR이 무엇을 왜 바꾸는지 1~3문장>

## 변경 사항

- <핵심 변경 1>
- <핵심 변경 2>

## 변경 이유 / 배경

<문제 상황이나 요구사항. 관련 이슈가 있으면 `Closes #번호`>

## 테스트

- [ ] `<테스트 명령>` 통과
- [ ] `<린트/타입체크 명령>` 통과
- [ ] 수동 확인: <확인한 시나리오>

## 리뷰어 참고

<중점적으로 봐야 할 파일, 설계 선택의 이유, 알려진 한계. 없으면 "해당 없음">

## 스크린샷

<UI 변경이 있으면 전/후 이미지. 없으면 "해당 없음">
```

---

## EN

```markdown
## Summary

<What this PR changes and why, in 1-3 sentences>

## Changes

- <Key change 1>
- <Key change 2>

## Motivation / Context

<The problem or requirement. Link related issues with `Closes #number`>

## Testing

- [ ] `<test command>` passes
- [ ] `<lint / typecheck command>` passes
- [ ] Manual check: <scenario verified>

## Notes for Reviewers

<Files to focus on, design trade-offs, known limitations. "N/A" if none>

## Screenshots

<Before/after images for UI changes. "N/A" if none>
```
