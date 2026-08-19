# CLAUDE.md

## 영문 레이아웃 대응

영어는 같은 뜻을 적는 데 한글보다 글자가 더 든다. 문구가 길어지면서 밀리거나
접히는 자리를 페이지 단위로 잡았다. 15개 네임스페이스를 다 돌았고, 아래는
그 과정에서 나온 규칙이다. 문구를 크게 손대거나 새 화면을 붙일 때 다시 본다.

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
| detail | 53 | 완료 | 1 — 22px 고정 칸 |
| coupon | 57 | 완료 | 0 |
| company | 69 | 완료 | 0 |
| cart | 67 | 완료 | 0 |
| login | 65 | 완료 | 0 |
| delivery | 57 | 완료 | 0 — 아래 SVG 절 참고 |
| help | 37 | 완료 | 0 |
| ctg | 30 | 완료 | 0 |
| layout | 27 | 완료 | 0 |
| receipt | 22 | 완료 | 0 — 아래 구조 버그 참고 |
| promo | 16 | 완료 | 0 |
| common | 16 | 완료 | 0 |

15개 중 12개가 0개로 끝났다. 오버라이드가 붙은 셋(main · careers · detail)은
전부 초기에 한 페이지고, 아래 순서가 자리잡은 뒤로는 계속 0개다.

**큰 타이포는 그 자체로 비용이 아니다.** 후보로 찍어 둔 세 페이지가 모두 0개로
끝났다 — company 52px · login 46px · help 48px. 위험한 건 크기가 아니라
`긴 문구 × 큰 타이포`이고, 문구를 줄이면 크기는 그대로 둬도 된다. help는
`"Answered before you asked, / refunded before you bought"`를
`"Ask less. / Return sooner."`로 바꾸자 영어가 한국어보다 짧아졌다.

login도 0개다. 46px `.aside h2`가 `.asideTop`의 `max-width`에 1.7px 차이로 걸려
있었는데(당시 420px, 지금은 500px), 히어로를 `"Bring the urge." / "Fake the login."`
으로 바꾸자 여유가 91px이 됐다. 소셜 버튼 라벨도 `-ish` 패턴으로 통일하면서 넷 다
한국어보다 짧아졌다.

company는 52px 히어로 때문에 후보로 봤지만 0개로 끝났다. 히어로를
`"Nothing for sale." / "Taste still matters."`로 줄이자 한국어보다 짧아졌다.
넘친 건 `.facts dd`의 `"Unlimited"` 하나뿐이었고 — 900~910px 구간에서 칸이 131px인데
글자가 132px — 공백 없는 한 단어라 줄바꿈으로 흡수되지 않았다. `"Endless"`(102px)로
바꿔서 끝냈다. 오버라이드로 갔으면 미디어쿼리 짝까지 2개가 필요했다.

cart도 0개다. 30px 이상 타이포가 아예 없어 고정폭 칸만 봤고, 전부 통과했다.

### 세 번째 비용원 — SVG 고정 좌표

delivery의 가짜 지도는 지명을 `<text textAnchor="middle">`로 **고정 좌표에 박는다**.
줄바꿈도 칸도 없어서, 길어진 문구는 옆 라벨 위로 올라탄다. CSS 칸과 달리
`overflow`나 `ellipsis`가 개입할 여지가 없다.

영어에서 두 쌍이 실제로 부딪혔다.

| | 영어(이전) | 한국어 | 상황 |
| --- | --- | --- | --- |
| `areas.rationalize` × `steps.warehouse.place` | 97.6 × 171.2 | 48.0 × 75.8 | y가 214로 같아 26px 겹침 |
| `areas.home` × `steps.nearby.place` | 168.0 × 134.7 | 94.3 × 75.8 | 2px 차이로 스침 |

**CSS로는 못 푼다.** 글자를 40% 줄여야 들어가는데 11px에서 6px이면 못 읽고,
좌표를 언어별로 가르는 건 "여기엔 놓일 자리만 남긴다"는 이 파일의 설계를 깬다.
문구를 `Excuses Ave` · `Empty Warehouse` · `Empty House` · `Nearly There`로
줄여 해결했다. 넷 다 한국어와 비슷하거나 짧아져서 좌표를 옮겨도 여유가 남는다.

**검사할 때 x만 보면 안 된다.** 경유지 라벨은 index가 짝수면 점 아래(+26),
홀수면 위(-18)로 엇갈려 놓인다. 이 엇갈림이 가로로 겹쳐도 안 부딪히게 해 주는
장치라, x 범위만 비교하면 멀쩡한 쌍이 전부 충돌로 잡힌다.

### 문구를 줄이지 않고 CSS로 간 경우

detail의 `.revBars span`(평점 분포 라벨)은 `width: 22px` 고정 칸이다. `"5점"`은
16px이라 들어가지만 `"5 stars"`는 33px이라 칸 안에서 두 줄로 접힌다.

여기서는 문구를 줄이지 않았다. **줄일 군더더기가 있는지가 갈림길이다.** coupon과
detail의 `"Estimated arrival"` → `"Arrival"`은 뜻을 유지한 채 군더더기만 걷어낸
것이었지만, `"5 stars"`를 `"5"`로 깎으면 한국어 `"5점"`이 가진 단위를 영어에서만
버리게 된다. 이럴 때는 칸을 넓히는 쪽이 맞다.

```css
:global(html:lang(en)) .revBars span {
  width: 34px;
}
```

`.revBars span` 규칙이 파일에 하나뿐이라 미디어쿼리 짝 문제가 없다. 막대(`i`)가
`flex: 1`이라 12px을 내주고도 표시에 지장이 없다.

### 알려진 문제

**공유된 영수증은 언어가 섞인다.** `receiptLink.js`는 키가 아니라 번역된 결과를
주소에 싣는다(상품명 · 결제수단 · 절제 문구 · 등급). 껍데기만 `locales`를 따라가서,
한국어 브라우저로 영어 영수증 링크를 열면 두 언어가 함께 나온다.

`/receipt`에서 언어 토글을 뺀 것은 이 때문이다 — 그 화면에서 바꿔가며 섞이는 걸
보는 일은 없앴지만 원인은 남아 있다. 상품명은 스냅샷으로 싣는 것이 의도라
(`products.json`을 갈아엎어도 옛 링크가 살아 있게) 완전한 재번역은 불가능하고,
고치려면 링크에 언어를 실어 영수증을 그 언어에 고정하는 쪽이 맞다.
그때 `i18n.changeLanguage`를 직접 부르면 `LanguageDetector`가 저장해 사이트 전체가
바뀌므로, `i18n.cloneInstance({ lng })`를 영수증 페이지에만 씌워야 한다.

**`.utils`는 이제 없다.** 900px 이상에서만 나오던 글자 링크 묶음이었는데(로그인 ·
`안 살 것들`), 로그인은 계정 메뉴로 들어가고 장바구니는 아이콘으로 통일하면서
규칙과 JSX를 함께 지웠다. 같은 줄에 글자와 아이콘이 섞이면 두 조작이 다른 종류로
보인다. `Things you won't buy` 135px vs `안 살 것들` 54px이라는 영문 폭 비교도
이제 화면에 없는 문구다.

전에 `.utils`가 옆 검색창을 누른다고 적혀 있었으나 **검색창은 존재하지 않았다.**
`Layout.module.css`에 `.search` 규칙 30줄이 남아 있었지만 `styles.search` 참조가
코드에 0건이었다 — 지워질 때 CSS와 문서가 따라오지 않은 것이다. 죽은 규칙은
900px 미디어쿼리의 `.search, .utils { display: none }`까지 함께 정리했다.
이번에 `.drawerFoot` · `.btn` · `LanguageToggle` · `Detail.toggleAdjust`도 같은
이유로 지웠다.

### 하단 고정 바는 `hooks/useBottomBar`

**바 높이를 숫자로 박아 두지 말 것.** 바 안에는 요약줄·버튼·안내문이 세로로 쌓이고
높이가 문구 길이에 따라 달라진다. 언어 토글은 새로고침 없이 동작하므로 런타임에
바뀐다. 박아 둔 값은 전부 실제보다 낮았다.

| | 박혀 있던 값 | 실측 | 가려지던 것 |
| --- | --- | --- | --- |
| Checkout | 104px | 약 198px | `.disclaim`이 90px 넘게 |
| Cart | 96px | 약 119px | 목록 맨 아래 출처 문구 |

훅이 `ResizeObserver`로 재서 두 곳에 넣는다.

- 페이지 본문 — `pageRef`를 준 경우에만 그 요소의 `--bar-h`
- 전역 토스트 — `:root`의 `--toast-lift`

토스트가 `:root`로 가는 건 `AppToaster`가 페이지 바깥에 그려져 페이지 요소에 적은
변수가 닿지 않기 때문이다. `MOBILE_OFFSET.bottom`이 `30px`로 박혀 있어 토스트가
어느 바보다도 낮게 떠서 통째로 가려 있었다.

**`sonner`는 `--mobile-offset-*`을 600px 이하에서만 쓴다.** 바는 900px까지 고정이라
`mobileOffset`만 고치면 600~900px 구간이 빈다. `offset`도 같이 넣어야 한다.

**`pageRef`는 `--bar-h`를 실측해야 하는 페이지만 넘긴다.** detail은 CSS가 정하므로
(`.buybar { height: var(--bar-h) }`) 넘기지 않는다. 인라인으로 들어간 `--bar-h`는
미디어쿼리를 이겨서, 데스크톱에서 바를 끄는 규칙을 무력화한다.

같은 이유로 데스크톱 미디어쿼리는 `--bar-h: 0px`이 아니라 `padding-bottom: 0`으로
끈다.

데스크톱 판정은 기준점(900px)을 JS에 다시 적지 않고 `getComputedStyle(bar).position`이
`fixed`인지로 본다. 바가 흐름 안에 들어가면 띄울 이유가 없다.

### 영어가 드러낸 기존 버그 — `.receiptRow`

한 클래스가 정반대인 두 모양을 겸하고 있었다. 기본형은 "왼쪽이 고정 라벨,
오른쪽이 가변 값"이라 왼쪽에 `flex: none` + `white-space: nowrap`을 걸어 뒀는데,
상품 줄만 전제가 뒤집혀 있다 — 왼쪽이 상품명(가변), 오른쪽이 "구매 안 함"(고정).

안 줄어드는 상품명이 오른쪽을 눌러 `NOT / BOUGHT`로 접었고, 줄마다 오른쪽 끝이
어긋났다. **한국어에서도 모바일 63%가 이미 깨져 있었다** — 영어(85%)가 드러냈을
뿐 영어가 만든 문제가 아니다.

상품 줄에만 `.itemRow`를 붙여 뻣뻣한 대접을 오른쪽으로 옮겼다. 기준이 "이름
전체가 칸에 들어가는가"에서 "가장 긴 단어가 들어가는가"로 바뀌어 1446개 전부
통과한다. 상품명은 `data/products.json`에 있어 문구로는 못 푼다.

**`.receiptRow span:first-child`와 `.itemRow span:first-child`는 특정도가
(0,2,1)로 같다.** 순서로만 이기므로 `.itemRow` 규칙을 위로 옮기면 조용히 죽는다.

`gap`도 60px에서 16px로 줄였다. gap은 협상 불가라 두 칸이 쓰지 못하는 자리를
먼저 떼어가고, `space-between`이 어차피 양끝으로 벌려 줘서 넉넉히 둘 이유가 없다.
480px에서 한 줄로 끝나는 상품이 영어 기준 18% → 97%가 됐다.

### 문구가 locales 밖에 있는 곳

ctg의 카테고리 이름은 `locales`가 아니라 `src/data/{lang}/category.json`에 있다
(95개). `.catHero h1`(34px)과 하위 카테고리 칩에 들어가는 게 이 값이라, 페이지를
검사할 때 `locales`만 보면 정작 큰 타이포에 들어가는 문구를 빼먹는다.

영어가 한국어의 두 배 가까이 된다 — `간편식·냉동식품` 234px vs
`Ready Meals & Frozen Foods` 462px. 한국어는 가운뎃점으로 붙이는데 영어는 `&`에
공백까지 붙기 때문이다.

그런데도 0개로 끝났다. 이 페이지에는 긴 문구를 받아낼 장치가 이미 둘 있다.

- `.catHero h1`이 `display: flex; flex-wrap: wrap` — 개수(`<small>`)가 아랫줄로 내려간다
- `.subrail`이 `overflow-x: auto` — 칩이 `nowrap`인 대신 레일이 가로로 스크롤된다

카테고리 이름은 데이터라 길이를 통제할 수 없어서, 한국어로 만들 때부터 이렇게
잡아 둔 것으로 보인다. 상품명 · 리뷰도 같은 성격이라 같은 취급을 받는다.

### 검사

문구를 크게 갈아엎은 뒤에는 코드가 부르는 키가 두 언어에 다 있는지 확인한다.
JSX의 `t()` 호출을 뽑아 실제 i18next로 조회하면 된다. 복수형 키는 `base_one` ·
`base_other`로 저장되므로 `count`를 같이 넘겨야 찾아진다 — 안 그러면 멀쩡한 키가
전부 누락으로 잡힌다.

## 클래스만으로는 요소 선택자를 못 이긴다

`.section p`처럼 **요소가 붙은 규칙이 이미 그 자리를 잡고 있으면**, 클래스만 얹은
규칙은 조용히 죽는다. 아래로 내려도 안 살아난다 — 지는 이유가 순서가 아니라
특정도라서다.

```
.section p          (0,1,1)   클래스 + 요소
.revNote            (0,1,0)   클래스만        ← 아래에 있어도 진다
.section p.revNote  (0,2,1)   ← 이렇게 얹어야 이긴다
```

`Detail.module.css`의 `.revNote`가 이걸 밟았다. `margin` · `font-size` ·
`line-height` · `color` 넷을 적었는데 `.section p`가 같은 넷을 전부 잡고 있어서
규칙이 통째로 무시됐다. 화면에는 본문과 똑같은 14px `--n-800`이 나왔고, 그래서
"고지가 아니라 그냥 문단으로 보인다"는 모양이 됐다.

**"CSS를 썼는데 아무 일도 안 일어난다"면 특정도부터 센다.** 지금까지 이 저장소에서
세 가지 모양으로 나왔다.

| | 지는 쪽 | 이기는 쪽 | 왜 |
| --- | --- | --- | --- |
| 미디어쿼리 짝 | `@media { .hero h1 }` (0,1,1) | `:global(html:lang(en)) .hero h1` (0,2,2) | 미디어쿼리는 특정도를 올려 주지 않는다 |
| 동점 | `.itemRow span:first-child` | `.receiptRow span:first-child` | 둘 다 (0,2,1)이라 순서로만 갈린다 |
| 요소 선택자 | `.revNote` (0,1,0) | `.section p` (0,1,1) | 클래스 하나로 클래스+요소를 못 넘는다 |

앞의 둘은 순서로 풀리지만 **마지막 하나는 순서로 안 풀린다.** 그래서 새 클래스를
만들기 전에, 그 요소를 이미 잡고 있는 규칙이 있는지부터 본다.
`Detail.module.css`는 `.section p` · `.section h2` · `.section h2 small`을 갖고 있어
특히 밟기 쉽다.

전용 클래스를 새로 파는 대신 **원본 규칙을 고치는 쪽이 나을 때도 있다.** 리뷰 제목
옆 개수(`.section h2 small`)를 15px에서 13px로 줄일 때가 그랬다 — `<small>`이 붙은
h2가 그 파일에 하나뿐이라, 클래스를 파면 특정도만 복잡해지고 얻는 게 없었다.

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

여닫는 규칙은 `hooks/useDismissable`이 갖고 있다 — 바깥클릭(`pointerdown`) ·
Escape · 포커스 복귀 셋이다. `Select`와 헤더 계정 메뉴(`components/AccountMenu`)가
나눠 쓴다. 화살표 · Home/End · `aria-activedescendant`는 listbox 전용이라 `Select`에
남아 있다.

**Escape는 트리거가 아니라 감싸는 요소에서 받는다.** 계정 메뉴는 초점이 패널 안으로
들어가므로 트리거에만 걸면 그 안에서 누른 Escape를 놓친다. `Select`는 초점이
트리거에 남지만 버블링으로 똑같이 동작한다.

계정 메뉴는 값을 고르는 listbox가 아니라 컨트롤을 담는 상자라 `combobox` 의미를
쓰지 않는다. 안의 두 묶음은 네이티브 `<input type="radio">`다 — 화살표 키 이동 ·
묶음 · 라벨 연결이 딸려 와서 `aria-pressed` 버튼으로 흉내 내는 것보다 짧고 정확하다.
트리거에 `aria-haspopup`은 쓰지 않는다. `"true"`는 `menu`와 같은 뜻이라 스크린리더를
메뉴 모드로 들여보낸다.

## 웹사이트이면서 앱이다 — `android/`

같은 코드가 브라우저에서도 돌고 Capacitor로 감싼 안드로이드 앱으로도 돈다.
`npx cap sync android`가 `build/`를 `android/app/src/main/assets/public`으로
복사한다. **`npm run build`만 하고 sync를 빼면 앱은 옛 화면을 계속 띄운다.**

### 네이티브 설정은 이미 `android/`에 쌓여 있다

`capacitor.config.json`이 세 줄뿐이라고 아무것도 설정 안 된 것이 아니다.
`cap add android` 이후로 실제 설정은 `android/app/src/main/res`와
`AndroidManifest.xml`에 쌓인다. 여기를 열어 보지 않고 판단하면 이미 있는 것을
"없으니 만들자"고 하게 된다. 실제로 그렇게 세 번 틀렸다.

| | 실제 상태 |
| --- | --- |
| 스플래시 | **이미 있다.** 안삼 로고(파란 쇼핑백 + 마이너스)가 26개 밀도 폴더에 있고, `AppTheme.NoActionBarLaunch`가 `Theme.SplashScreen`(Android 12+ 공식 API)으로 띄운다 |
| 상태바 | 색만 바꾸는 것은 `styles.xml`에 `android:statusBarColor` 한 줄이다. 플러그인은 화면마다 색을 바꿀 때만 필요하다 |
| 뒤로가기 | 아무도 처리하지 않고 있었다 — 아래 참고 |

`@capacitor/splash-screen`은 스플래시를 만드는 플러그인이 아니라 JS에서 숨는
시점을 제어하는 것이다. 지금 구조에는 필요 없다.

### 뒤로가기는 우리가 처리한다

`@capacitor/android` 자바 소스에 `onBackPressed`도 `OnBackPressedCallback`도
없다. 안드로이드 기본값(액티비티 종료)이 그대로 돌아서, 상세 화면에서 눌러도
목록으로 가지 않고 앱이 꺼졌다.

`hooks/useBackButton`이 `App.js`에서 한 번만 걸린다. 화면마다 달지 않는다 —
라우터 바깥에서 오는 신호라 어느 화면이 떠 있든 같은 곳이 받아야 한다.

1. 드로어 · 모달이 열려 있으면 그것부터 닫는다
2. 앞 화면이 있으면 뒤로 간다
3. 첫 화면이면 2초 안에 한 번 더 눌러야 나간다

1번은 열림 상태를 새로 들지 않는다. 드로어(`Layout.jsx`)와 모달
(`Checkout.jsx`)이 이미 Escape를 듣고 있어 같은 신호를 대신 보낸다.
**새 오버레이를 만들 때 Escape로 닫히게 해 두면 뒤로가기가 저절로 따라온다.**

2번 판별(`window.history.state?.idx > 0`)은 `useGoBack`이 헤더 ← 버튼에 쓰는
것과 같다. 기기 버튼과 화면 버튼이 다르게 움직이면 안 된다.

`Select` 드롭다운은 `body` 클래스를 붙이지 않아 1번을 타지 않는다. 대신 2번으로
넘어가며 화면과 함께 사라져서 갇히지는 않는다.

### 브라우저 기본 동작을 끄는 것은 `html.native`에만

`index.js`가 `Capacitor.isNativePlatform()`일 때만 `<html>`에 `native`를 붙인다.
**웹에서 텍스트 선택을 막으면 복사하려는 사람을 막는 짓이다.** 앱에서만 옳은
일이라 전역으로 걸면 안 된다.

`.native`에만 거는 것 — 길게 누르기 메뉴(`-webkit-touch-callout`), 드래그
선택(`user-select`), 오버스크롤 잔광(`overscroll-behavior`). 이 중 길게 누르기
메뉴가 앱에서 제일 티 나는 브라우저 동작이다. "복사 / 웹 검색"이 뜨는 순간
정체가 드러난다.

어디서나 거는 것 — 탭 하이라이트 제거. 단 **`a:active` · `button:active`와
반드시 세트다.** 코드베이스에 `:active`가 하나도 없어서 하이라이트가 유일한
눌림 반응이었고, 지우기만 하면 앱이 죽은 것처럼 보인다.

### 폰트는 앱 안에 있다

`public/fonts/noto-sans-kr/`에 woff2 조각 372개(weight 3개 × 124조각)가 있고
`index.html`이 `<link>`로 건다. 예전에는 `index.css`가 `fonts.googleapis.com`을
`@import` 했는데, 앱을 켤 때마다 인터넷을 타고 그동안 글자가 안 그려졌다.
`@import`는 CSS를 받은 뒤에야 그 안의 URL을 발견해 요청이 직렬로 이어진다.

**구글의 `unicode-range` 나눔을 그대로 유지했다.** 브라우저가 화면에 나온 글자가
든 조각만 읽으므로 읽는 양은 전과 같고, 무엇보다 **문구를 바꿔도 폰트를 다시
만들 필요가 없다.** 쓰는 글자만 골라 서브셋으로 구웠다면 리뷰에 처음 보는 글자가
하나 나올 때마다 다시 구워야 한다 — 상품명 · 리뷰는 데이터라 길이도 글자도
통제할 수 없다.

APK가 12 MB 늘어난다. 읽는 양이 아니라 설치 용량의 문제다.

밖으로 나가는 연결은 이제 Pexels(상품 이미지) 하나뿐이고 개인정보 처리방침이
그렇게 적혀 있다. **폰트를 다시 원격으로 돌리면 처리방침도 같이 고쳐야 한다.**

### `font-weight`는 400 · 600 · 800만 실린다

`700`을 적으면 브라우저는 없는 굵기를 합성하지 않고 가까운 것을 고른다. 500보다
크면 위쪽부터 찾으므로 **`700`도 `750`도 전부 `800`으로 그려진다.** 한때 CSS에
`700`이 52곳 있었고 전부 800으로 나오고 있었다. 지금은 셋으로 정리했다.

새로 적을 때 `700`을 쓰면 조용히 `800`이 된다. 굵기는 셋 중에서 고른다.

## 다크 모드

`<html data-theme="dark">` 하나로 갈린다. `public/index.html`의 부팅 스크립트가
`localStorage.ansamTheme`와 OS 설정을 읽어 첫 페인트 전에 정하고, 헤더 계정
메뉴(`components/AccountMenu`)가 그걸 바꾼다.

**CSS에 `prefers-color-scheme`을 쓰지 않았다.** 미디어쿼리와 속성 선택자를 둘 다
두면 팔레트가 두 벌이 되어 토큰 29개가 전부 짝 맞추기 대상이 된다 — 위
`오버라이드 작성 규칙` 절이 경고하는 문제가 색 전체로 번진다. OS를 읽는 자리는
부팅 스크립트 한 군데뿐이다. 그 스크립트는 번들보다 앞에서 동기로 돌아야 한다.
늦으면 밝은 화면이 한 번 번쩍인다.

### accent 램프를 통째로 반전하면 안 된다

이 작업에서 제일 많이 밟은 함정이다. 램프가 놓이는 자리는 둘이고 방향이 반대다.

| 얹히는 곳 | 다크에서 |
| --- | --- |
| 페이지 배경(`--bg` · `--card`) 위 | 반전한다. 밝아져야 읽힌다 |
| 어두운 면 위 | 반전하면 안 된다. 면이 두 모드 다 어둡다 |

**같은 토큰이 두 자리를 겸한다.**

| 토큰 | 반전해야 하는 자리 | 반전하면 안 되는 자리 |
| --- | --- | --- |
| `--accent-900` | 틴트 위 글자 5곳 | 히어로 배경 6곳 |
| `--accent-100` | 틴트 배경 24곳 | 그 히어로 위 본문 8곳 |
| `--accent-200` | 틴트 배경 7곳 | accent 면 위 보조 글자 3곳 |
| `--accent` | 글자 · 테두리 57곳 | 면 배경 42곳 |

한 벌로 반전하면 Careers · Company · Help · Privacy · Promo · Coupon의 히어로가
거의 흰 판이 되고 그 위 흰 글자가 사라진다. 두 장치로 갈랐다.

### `--accent-fill` — 면은 밝아지지 않는다

```
--accent       글자 · 테두리    라이트 #4b70d3 → 다크 #7290e8 (밝아진다)
--accent-fill  흰 글자 얹는 면   두 모드 다 #4b70d3 (흰 글자 대비 4.61)
--accent-600   위 면의 hover    두 모드 다 #3a5cbd (6.09)
```

`--accent-600`을 반전시키면 hover가 버튼을 밝게 만들어 그 위 흰 글자가 2.94까지
떨어진다. **다크 블록에 없는 토큰은 일부러 없는 것이다** — 라이트 값을 그대로
물려받는다.

색만 칠하는 얇은 바(진행률 · 평점 막대 7곳)는 `--accent-fill`이 아니다. 페이지
배경 위라 다크에서 밝아져야 한다.

### `.onDark` — 어두운 면 안은 라이트 팔레트

면을 그리는 요소에 얹으면 그 안의 `var(--...)`가 전부 라이트 값으로 풀린다.
**호출부는 한 줄도 안 고친다.**

```css
.hero { composes: onDark from global; background: var(--accent-900); }
```

`composes: ... from global`은 CSS 모듈 문법이라 JSX를 안 건드린다. 다만
**단일 클래스 셀렉터에만 쓸 수 있다** — `.tabs button[aria-selected="true"]`
같은 자리에는 못 붙인다. 그래서 잎사귀 면(버튼 · 배지 · 태그)은 클래스 대신
`--accent-fill` + `--on-accent`로 끝낸다.

붙일 곳은 어두운 면이면서 **안에 토큰 쓰는 자식이 있는** 것이다. 지금 10곳 —
`--accent-900` 히어로 6개, 사진 히어로(`Main.hero`), 사진 위 스크림
(`Detail.dots`), 도파민 미터(`Checkout.dopa`), 어두운 중성 판
(`Coupon.achievements`), 로그인 왼쪽 패널(`Login.aside`).

`--bg` · `--surface` · `--border` · `--rule`은 일부러 안 되돌린다. 넷 다 이 면이
아니라 페이지를 가리킨다. 어두운 면에 붙은 `--border` 10곳은 전부 그 면의 **바깥**
테두리(히어로 아래 선 · `Login.aside` 오른쪽 선 · 슬라이더 썸)라 페이지와 맞닿는다.

### 토큰

라이트에서 값이 겹쳐 하드코딩으로 버티던 것들이 다크에서 갈라진다.

| 토큰 | 쓰이는 곳 | 전에는 |
| --- | --- | --- |
| `--border` | 96 | `var(--text)` |
| `--on-accent` | 75 | `#fff` |
| `--accent-fill` | 35 | `var(--accent)` |
| `--card` | 28 | `#fff` |
| `--on-text` | 20 | `#fff` |
| `--icon-size` | 8 | JSX의 `size={19~24}` |
| `--scrim` | 2 | `rgba(28, 30, 36, 0.55)` |

1px 실선은 이미 `--n-300`이 59곳을 잡고 있어 따로 토큰을 두지 않았다.

**root에는 자주 반복되는 것만 둔다.** 한 페이지에만 있는 색은 그 페이지 CSS에
`:global(html[data-theme="dark"])`로 얹는다.

- 배송 지도 면 — `Delivery.module.css`의 `--map-bg`. 경로의 흰 테 · 정류장 점 ·
  마커 외곽선 · 라벨 외곽선이 전부 "지도 바탕을 오려낸 자리"라 바탕과 같은
  색이어야 한다. 다크에서 흰색으로 남으면 어두운 지도 위에 흰 선이 그려진다
- 쿠폰 카드 앰버 · 민트 면과 그 잉크 — 중성 램프(`--n-600`은 푸른 회색)를 따뜻한
  갈색 면에 얹으면 색온도가 어긋나 면마다 잉크를 따로 잡는다

남은 하드코딩 색 46개 중 **37개가 Coupon**이다(4색 로테이션 · 색종이 · 삭제 버튼).
나머지 9개는 사진 위 스크림과 그림자다.

### 그림자는 면보다 어두워야 한다

`box-shadow: 5px 5px 0 var(--n-300)`이 다크에서 `#343940`인데 카드(`#262a31`)보다
**밝아서** 그림자가 아니라 글로우로 보였다. 중성 램프를 그림자에 쓰면 반전하면서
방향이 뒤집힌다. 쿠폰 카드 · 쿠폰함은 다크 전용 값으로 눌렀다.

### 검사

- **라이트가 안 바뀌었는지** — HEAD 판과 현재 판을 각각 라이트 팔레트로 풀어 색
  선언을 비교한다. 집합이 아니라 **개수**로 비교해야 한다. 같은 선언이 여러 번
  나오는 경우를 집합은 놓친다
- **다크가 안 깨지는지** — 같은 규칙 안의 배경 + 글자를 다크 팔레트로 풀어 대비를
  잰다. `color:`는 `background-color:` · `border-color:` 안에도 들어 있으므로
  경계를 잡아야 한다. 안 그러면 멀쩡한 규칙이 전부 걸린다
- 스크립트가 성공을 찍어도 **빌드 산출물에서 확인한다.** 실제로 한 클래스가 조용히
  빠진 적이 있다 — CRLF 파일에서 `\n`만 지워 `\r\r\n`이 남는 바람에 다음 정규식이
  안 맞았다
- 이 저장소의 테스트 도구는 jsdom뿐이라 레이아웃을 계산하지 않는다. `offsetTop` ·
  넘침 · 실제 색은 브라우저에서 봐야 한다

## 다음 할 일 — 릴리스

### 지금 어디까지 왔나 (2026-08-19)

| | 상태 |
| --- | --- |
| 피드백 대응 6건 (히어로 · 로그인 · 리뷰 고지 · 지연 · WebView 티 · 뒤로가기) | 커밋 완료 |
| 앱 이름 — `values-en/strings.xml` | 완료 |
| 플레이 콘솔 영어 리스팅 — 이름 `NOBUY` + 설명문 | 완료 |
| 다크 모드 (웹) | 완료 — `dark-mode` 브랜치 |
| 상태바 색 · 네이티브 나이트 모드 | 완료 |
| 새 AAB · 플레이 업로드 | **남음** |

`android/app/release/`의 AAB(17.1 MB)는 다크 모드 이전 것이라 **버린다.** 남은 것은
새로 만들어 올리는 일뿐이다.

### 상태바는 색이 아니라 나이트 모드로 맞춘다

테스터가 **검은 상태바 위에 흰 헤더**가 붙은 스크린샷을 보낸 데서 시작했다.
처음에는 `styles.xml`에 `android:statusBarColor` 한 줄이면 될 줄 알았는데
그 판단이 두 번 틀렸다.

**첫째, `statusBarColor`는 이제 무시된다.** targetSdk 35부터 엣지투엣지가
강제라 이 속성은 아무 일도 하지 않는다. 36에서는 예외 신청
(`windowOptOutEdgeToEdgeEnforcement`)조차 안 먹는다. 우리 타깃은 36이다.
`StatusBar.setBackgroundColor()`도 같은 이유로 no-op이다 — Capacitor 8의 코어
`SystemBars` 플러그인이 그 메서드를 아예 안 만든 것도 그래서다.

상태바는 **투명**해지고 그 뒤로 창 배경(`android:windowBackground`)이 비친다.
그러니 실제로 보이는 색은 이쪽이다.

**둘째, XML만으로는 앱 안 토글을 못 따라간다.** `values-night`는 시스템 다크
설정으로 갈린다. 라이트 OS에서 앱 토글로 다크를 고르면 웹뷰만 어두워지고
상태바는 밝은 채로 남는다.

그래서 리소스 설정 자체를 바꾼다.

```java
// ThemePlugin.setNightMode
AppCompatDelegate.setDefaultNightMode(ThemeStore.toDelegateMode(mode));
```

이러면 `values-night`가 "시스템이 다크일 때"가 아니라 **"앱이 다크를 고를 때"**
적용된다. 순수 네이티브 앱이 Light / Dark / System을 만드는 방식과 같다.

| 파일 | 맡는 일 |
| --- | --- |
| `ThemeStore.java` | 고른 값을 SharedPreferences에 두고 AppCompat 모드로 옮긴다 |
| `ThemePlugin.java` | 웹이 부르는 `Theme.setNightMode({ mode })` |
| `MainActivity.java` | 앱이 뜰 때 저장값을 읽어 적용 |
| `res/values{,-night}/colors.xml` | `@color/appBg` — 창 배경, 상태바 뒤에 비치는 색 |
| `res/values{,-night}/bools.xml` | `@bool/statusBarLight` — 아이콘 색 |

**자바는 localStorage를 못 읽는다.** 앱이 뜨는 순간에는 웹뷰가 아직 없어
`evaluateJavascript`도 못 쓴다. 그래서 같은 값을 두 곳에 따로 저장한다 —
웹은 localStorage(부팅 스크립트용), 네이티브는 SharedPreferences. 둘을 잇는
것은 토글이 부르는 플러그인 호출뿐이고, 어긋나면 `AccountMenu`의 마운트
이펙트가 다음에 다시 맞춘다. `@capacitor/preferences`로 한 벌로 줄일 수는
있지만 읽기가 비동기라 부팅 스크립트에서 못 쓴다 — 화면이 한 번 번쩍인다.

### 이 전환에서 두 번 밟은 것

**액티비티가 다시 만들어지지 않는다.** 매니페스트 `configChanges`에 `uiMode`가
있어서 나이트 모드가 바뀌어도 액티비티가 재생성되지 않는다. 웹뷰가 리로드되지
않는 것은 좋은데, **창 배경도 저절로 다시 칠해지지 않는다.** `ThemePlugin`이
`decorView`를 직접 칠하는 이유다. `decor.post()`로 미루는 것은
`setDefaultNightMode`가 `onConfigurationChanged`를 거쳐 리소스를 갈아끼우기
때문이다 — 같은 프레임에 읽으면 옛 색이 나온다.

**`registerPlugin`과 `setDefaultNightMode`는 `super.onCreate` 앞이다.** super가
테마를 적용하고 화면을 만들므로, 뒤에 두면 첫 프레임이 옛 색으로 한 번 그려진다.

**자바를 고쳤으면 `cap sync`만으로는 안 된다.** sync는 웹 자산을 복사하고
플러그인 목록을 갱신할 뿐이다. APK를 다시 빌드해 설치해야 한다. 에뮬레이터에
옛 APK가 남아 "안 되는 줄" 알았던 적이 있다. Android Studio에서는 번개 아이콘
(Apply Changes)이 아니라 **Run 'app'** 이어야 리소스와 플러그인 등록이 들어간다.

터미널 빌드는 JDK 21 이상이 필요하다. 셸의 `java`가 그보다 낮으면
`invalid source release: 21`이 난다. Android Studio는 번들 JBR을 쓰므로 잘 된다.

### 아직 안 한 것

- **3단 토글(Light / Dark / System).** 플러그인은 `"system"`을 이미 받아
  `MODE_NIGHT_FOLLOW_SYSTEM`으로 옮기는데 웹이 아직 안 보낸다. 지금은 저장값이
  없을 때만 OS를 따르므로 한 번 고르면 되돌아갈 길이 없다. 웹에 세 번째 칸을
  만들고 `"system"`일 때 `matchMedia` 변경을 듣게 하면 된다
- **`@capacitor/status-bar`.** 이제 `setStyle`(아이콘 색) 하나만 쓴다. Capacitor 8
  코어 `SystemBars`에 같은 것이 있는데 JS 노출을 확인하지 못해 남겨 뒀다
- **`/receipt`에는 계정 메뉴가 없다.** 그 화면에서는 테마를 못 바꾸고
  `syncChrome`도 돌지 않는다

### 잊기 쉬운 것

- `public/index.html`의 `theme-color`는 `syncChrome`이 직접 바꾼다. `media` 속성으로
  나누면 토글이 아니라 OS를 따라가서 쓸 수 없다. 값이 세 곳에 흩어져 있으므로
  (`index.css`의 `--bg`, `AccountMenu`의 `BAR`, `res/values*/colors.xml`의 `appBg`)
  하나를 고치면 나머지도 봐야 한다
- 상품 사진은 Pexels라 토큰을 안 탄다. `:root[data-theme="dark"] img`에
  `opacity: .92`를 걸어 카드만 어두워질 때 사진이 혼자 떠오르는 것을 눌렀다




