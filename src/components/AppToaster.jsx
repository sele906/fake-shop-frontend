import { Toaster } from "sonner";

/**
 * 사이트 전역 토스트. 모양을 바꾸려면 여기만 고치면 된다.
 *
 * sonner 기본 모양은 흰 판에 둥근 모서리라, 프로젝트의 검은 판 · 각진 스타일로 덮는다.
 *
 * 스타일을 CSS 모듈로 옮기지 말 것. sonner가 `[data-sonner-toaster] [data-sonner-toast]`
 * (속성 선택자 2개)로 스타일을 걸어 두어서 클래스 하나로는 우선순위가 밀린다.
 * toastOptions.style은 인라인으로 들어가기 때문에 그걸 이긴다.
 *
 * 같은 이유로 여기에 width를 적으면 안 된다. sonner는 600px 이하에서 토스트를
 * `calc(100% - 좌우 여백)`으로 줄여 화면에 맞추는데, 인라인 width가 그걸 덮어써
 * 모바일에서 토스트가 오른쪽으로 삐져나간다. 폭은 아래 CSS 변수로 조절한다.
 */

/* 데스크톱 토스트 폭. 모바일에서는 MOBILE_OFFSET이 대신 폭을 정한다. */
const WIDTH = "356px";

/* 장바구니 · 상세의 하단 고정 바를 가리지 않게 띄워 둔다.
   left 값은 여백이면서 동시에 모바일 토스트 폭의 기준이기도 하다. */
const MOBILE_OFFSET = { bottom: "30px", left: "16px", right: "16px" };

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      duration={2000}
      mobileOffset={MOBILE_OFFSET}
      style={{ "--width": WIDTH }}
      toastOptions={{
        style: {
          background: "var(--text)",
          color: "#fff",
          border: 0,
          borderRadius: 0,
          boxShadow: "none",
          fontFamily: "var(--font)",
          fontSize: "14px",
          lineHeight: 1.5,
          padding: "14px 16px",
        },
      }}
    />
  );
}
