import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

/* 두 번째 누름을 "종료하겠다"로 받아 줄 시간. */
const CONFIRM_MS = 2000;

/**
 * 안드로이드 기기의 뒤로가기 버튼.
 *
 * Capacitor는 이걸 아무도 처리하지 않는다 — 자바 쪽에 onBackPressed도
 * OnBackPressedCallback도 없어서 안드로이드 기본값(액티비티 종료)이 그대로 돈다.
 * 그래서 상세 페이지에서 눌러도 목록으로 가지 않고 앱이 꺼졌다.
 *
 * 처리 순서는 사용자가 "지금 덮여 있는 것"부터 걷어낸다고 기대하는 순서다.
 *
 *   1. 드로어 · 모달이 열려 있으면 그것부터 닫는다
 *   2. 앞 화면이 있으면 뒤로 간다
 *   3. 첫 화면이면 한 번 더 눌러야 나간다
 *
 * 웹에서는 아무것도 하지 않는다. 브라우저에는 이 버튼이 없고,
 * @capacitor/app의 리스너도 네이티브에서만 실제로 불린다.
 */
export default function useBackButton() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const leavingAt = useRef(0);

  /**
   * 이펙트는 마운트 때 한 번만 돈다. 둘 다 의존성에 넣을 수 없다 —
   * navigate는 화면을 옮길 때마다, t는 언어를 바꿀 때마다 정체가 바뀌어서
   * 리스너를 지웠다 다시 다는 일이 화면 이동마다 반복된다.
   *
   * 지우는 쪽이 프라미스라 비동기고 다는 쪽은 바로 도는데, 그 사이에
   * 뒤로가기를 누르면 리스너 둘이 함께 받아 두 칸 물러난다.
   *
   * 눌린 순간의 값만 있으면 되므로 ref로 최신 것을 본다. useDeepLink와 같다.
   */
  const navigateRef = useRef(navigate);
  const tRef = useRef(t);

  navigateRef.current = navigate;
  tRef.current = t;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handle = App.addListener("backButton", () => {
      /* 드로어와 모달은 이미 Escape로 닫히도록 각자 듣고 있다. 여기서 상태를
         새로 들고 있으면 두 벌이 되므로, 같은 신호를 대신 보내 준다. */
      const body = document.body.classList;

      if (body.contains("navOpen") || body.contains("modalOpen")) {
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
        );
        return;
      }

      /* idx는 react-router가 history.state에 넣는 방문 순번이다.
         0이면 이 세션에서 여기가 첫 화면이라 돌아갈 곳이 없다.
         useGoBack이 헤더 ← 버튼에서 쓰는 판별과 같다. */
      if (window.history.state?.idx > 0) {
        navigateRef.current(-1);
        return;
      }

      const now = Date.now();

      if (now - leavingAt.current < CONFIRM_MS) {
        App.exitApp();
        return;
      }

      leavingAt.current = now;
      toast(tRef.current("exitConfirm"));
    });

    /* addListener는 프라미스를 준다. 정리할 때 그 안의 handle을 써야 한다. */
    return () => {
      handle.then((listener) => listener.remove());
    };
  }, []);
}
