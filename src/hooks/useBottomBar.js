import { useLayoutEffect, useState } from "react";

/**
 * 전역 토스트가 읽는 변수. 하단 고정 바 높이가 들어간다.
 *
 * AppToaster는 페이지 바깥에 그려지므로 페이지 요소에 적은 변수가 닿지 않는다.
 * 그래서 documentElement에 적는다.
 */
const LIFT = "--toast-lift";

/**
 * 하단 고정 바를 재서 알린다.
 *
 * 두 곳이 이 값을 쓴다.
 *
 * - 전역 토스트 — 바 위로 띄운다 (:root의 --toast-lift)
 * - 페이지 본문 — 바에 가리지 않게 아래를 비운다 (pageRef를 준 경우에만 --bar-h)
 *
 * 바 높이를 숫자로 박아 두면 맞지 않는다. 안에 쌓이는 줄 수와 글자 길이에 따라
 * 달라지고, 언어 토글은 새로고침 없이 동작해 런타임에 바뀐다. Checkout이 같은
 * 이유로 같은 방식을 쓴다.
 *
 * 바가 흐름 안에 있는 페이지(--bar-h를 CSS가 정하는 Detail 같은 곳)는 pageRef를
 * 주지 않는다. 인라인으로 넣은 --bar-h는 미디어쿼리를 이겨서, 데스크톱에서
 * 바를 끄는 규칙을 무력화한다.
 *
 * @param {React.RefObject<HTMLElement>} [pageRef] --bar-h를 받을 페이지 요소
 * @returns {(node: HTMLElement | null) => void} 바 요소에 걸 ref
 */
export default function useBottomBar(pageRef) {
  /* 콜백 ref로 받는다. 바가 붙고 떨어질 때(장바구니가 비는 등) 효과가 알아서
     다시 돌아, 바깥에서 의존성을 챙기지 않아도 된다. */
  const [bar, setBar] = useState(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const page = pageRef?.current ?? null;

    const clear = () => {
      root.style.setProperty(LIFT, "0px");
      if (page) page.style.setProperty("--bar-h", "0px");
    };

    if (!bar) {
      clear();
      return;
    }

    const observer = new ResizeObserver(() => {
      const height = bar.offsetHeight;

      /* 데스크톱에서는 바가 흐름 안으로 들어와 본문을 가리지 않는다. 그때는
         띄울 것도 없다. 기준점(900px)을 JS에 다시 적지 않으려고 실제로 어떻게
         배치됐는지를 본다. */
      const lifted = getComputedStyle(bar).position === "fixed";

      root.style.setProperty(LIFT, lifted ? `${height}px` : "0px");
      if (page) page.style.setProperty("--bar-h", `${height}px`);
    });

    observer.observe(bar);

    return () => {
      observer.disconnect();
      clear();
    };
  }, [bar, pageRef]);

  return setBar;
}
