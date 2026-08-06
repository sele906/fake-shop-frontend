# CLAUDE.md

## 진행 중: 영문 레이아웃 대응

영어는 같은 뜻을 적는 데 한글보다 글자가 더 든다. 문구가 길어지면서 밀리거나
접히는 자리를 페이지 단위로 잡고 있다.

### 순서는 문구 먼저, CSS 나중

이 순서를 뒤집으면 쓴 CSS를 다시 지우게 된다. 실제로 두 번 겪었다.

- Coupon — 문구를 줄인 뒤 오버라이드 5개가 전부 불필요해져 삭제
- Detail — 라벨을 `"Estimated arrival"` → `"Arrival"`로 줄이자 오버라이드 1개가 불필요해져 삭제

비용을 만드는 건 페이지 크기가 아니라 두 가지뿐이다.

1. 큰 디스플레이 타이포 (30px 이상)
2. 고정폭 칸 (`flex: 0 0 76px`, 고정 열 그리드, `white-space: nowrap`)

문단·리스트에 들어가는 문구는 아무리 길어져도 세로로만 늘어나므로 건드리지 않는다.

### 오버라이드 작성 규칙

언어 조건은 CSS 모듈에서 `:global(html:lang(en))`으로 건다. `<html lang>`은
`src/i18n.js`가 언어 전환마다 맞춰 주므로 JSX는 언어를 몰라도 된다.

```css
.hero h1 {
  font-size: 44px;
}

:global(html:lang(en)) .hero h1 {
  font-size: 39px;
}
```

**오버라이드는 반드시 짝이 되는 규칙 바로 아래에 둔다.** 미디어쿼리는 특정도를
올려 주지 않아서, 모바일 짝을 빠뜨리면 데스크톱 영어 값이 모바일까지 새어 나온다.

```
:global(html:lang(en)) .hero h1   (0,2,2)
@media { .hero h1 }               (0,1,1)   ← 진다
```

`grid-template-columns`처럼 레이아웃을 바꾸는 속성에서 특히 위험하다.
`Careers.module.css`의 `.intro`가 이 짝을 필요로 한다 — 빠뜨리면 영어만 모바일에서
2단 그리드가 남는다. 자세한 설명은 `Main.module.css` 상단 주석에 있다.

### 페이지 현황

| 네임스페이스 | 키 | 문구 | CSS 오버라이드 |
| --- | --- | --- | --- |
| main | 11 | 완료 | 11 — 44px 히어로 |
| checkout | 152 | 완료 | 0 |
| careers | 47 | 완료 | 5 — 30px 슬로건 + 미디어쿼리 짝 |
| detail | 53 | 완료 | 0 |
| coupon | 57 | 완료 | 0 |
| company | 69 | 대기 | 미확인 — 52px 히어로가 있어 후보 |
| cart | 67 | 대기 | 미확인 |
| login | 65 | 대기 | 미확인 — 46px `.aside h2` |
| delivery | 57 | 대기 | 미확인 |
| help | 37 | 대기 | 미확인 — 48px 히어로 |
| ctg | 30 | 대기 | 미확인 |
| layout | 27 | 대기 | 아래 알려진 문제 참고 |
| receipt | 22 | 대기 | 미확인 |
| promo | 16 | 대기 | 미확인 |
| common | 16 | 대기 | 미확인 |

남은 페이지는 큰 타이포가 있는 company · login · help가 CSS까지 갈 가능성이 높고,
cart · delivery · ctg · receipt · promo는 0개로 끝날 것으로 본다.

### 알려진 문제

**`Layout.module.css`의 `.utils`** — 헤더 우측 유틸이 `white-space: nowrap`이고
축소되지 않아, 옆 검색창(`flex: 1`)만 계속 눌린다. 900px 이하에서는 `.utils`가
숨겨지므로 900~1200px 구간만 해당한다. CSS가 아니라 문구가 원인이다 —
헤더 유틸에 `"Things you won't buy"`는 길다.

**`AppToaster.jsx`의 `MOBILE_OFFSET.bottom`** — 현재 `30px`. 하단 고정 바가 있는
페이지에서 토스트가 바와 겹친다. 바 높이는 Cart 96px, Detail 72px, Checkout 약 198px.

### 건드릴 때 주의

**`Checkout.module.css`의 `--bar-h`를 고정 숫자로 되돌리지 말 것.** 하단 바에는
요약줄·결제 버튼·"그래도 사고 싶어요"·안내문이 세로로 쌓이고, 높이가 문구 길이에
따라 달라진다. 언어 토글은 새로고침 없이 동작하므로 런타임에 바뀐다.
`Checkout.jsx`가 `ResizeObserver`로 실측해 넣는다. 원래 `104px`로 박혀 있었고
실제 높이가 약 198px라 한국어에서도 `.disclaim`이 90px 넘게 가려져 있었다.

같은 이유로 데스크톱 미디어쿼리는 `--bar-h: 0px`이 아니라 `padding-bottom: 0`으로
끈다. 인라인으로 들어간 `--bar-h`가 미디어쿼리를 이기기 때문이다.

### 검사

문구를 크게 갈아엎은 뒤에는 코드가 부르는 키가 두 언어에 다 있는지 확인한다.
JSX의 `t()` 호출을 뽑아 실제 i18next로 조회하면 된다. 복수형 키는 `base_one` ·
`base_other`로 저장되므로 `count`를 같이 넘겨야 찾아진다 — 안 그러면 멀쩡한 키가
전부 누락으로 잡힌다.

## 드롭다운은 `components/Select` 하나

**새로 만들지 말 것.** 겉모습이 달라야 하면 프롭으로 가른다.

```jsx
<Select labelledBy="..." />                              // 폼 (기본)
<Select variant="quiet" align="end" ariaLabel="정렬" />  // 툴바
```

- `variant` — `field`(테두리 · 46px · 칸 너비) / `quiet`(테두리 없이 글자와 캐럿만)
- `align` — `stretch`(트리거 너비) / `end`(오른쪽 기준)
- 이름은 `labelledBy`(보이는 라벨의 id) 또는 `ariaLabel` 중 하나

여닫는 동작 · 키보드 · 의미는 두 변형이 같다. 바깥 클릭(`pointerdown`) · Escape ·
↑↓ 순환 · Home/End · 포커스 복귀가 여기 한 군데에만 있다.

`SortDropdown`은 이 위에 얹은 얇은 프리셋이다. 정렬 목록의 `{ key, label }`을
`{ value, label }`로 옮기고, 모바일에서만 보이게 하고, 기본 라벨을 붙이는 것이
전부다. 원래 130줄짜리 별도 구현이었는데 로직이 두 벌로 갈라져 있었다.

의미는 `combobox` + `listbox` + `option`으로 통일했다. 정렬을 고르는 것도 명령을
실행하는 게 아니라 값을 고르는 일이라 `role="menu"`보다 이쪽이 맞고, `menu`는
스크린리더를 메뉴 모드로 들여보내 필요 이상으로 무겁다.

목록이 열려도 포커스는 트리거에 남고 짚은 항목은 `aria-activedescendant`로 알린다.
목록 항목은 눌리는 요소가 아니라 값이라서 포커스를 옮기지 않는다. 같은 이유로
항목의 `mousedown` 기본 동작을 막는다 — 안 막으면 누르는 순간 트리거가 초점을 잃는다.

### 아직 별개인 것

`Checkout.jsx`의 배송지 고르기는 아직 따로다. 전체 화면 모달에 `aria-pressed`
버튼을 깔고 `●` · `○`를 글자로 그린다. 단일 선택 의미로는 정확하지 않아 통합
후보지만, 주소마다 설명 문구가 붙는 큰 선택이라 모달이 정당한 면도 있다.

세 번째 드롭다운이 정말 다른 요구를 들고 오면, 갈라 쓰지 말고 여닫는 로직만
훅으로 뽑아 `Select`와 나눠 쓴다.
