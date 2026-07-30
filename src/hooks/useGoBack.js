import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 헤더의 ← 버튼용. 앞 화면이 있으면 뒤로 가고,
 * 링크를 직접 열어 들어온 첫 화면이면 홈으로 보낸다.
 *
 * idx는 react-router가 history.state에 넣어 주는 방문 순번이라,
 * 0이면 이 세션에서 이 화면이 첫 진입이라는 뜻이다.
 */
export default function useGoBack(fallback = "/") {
  const navigate = useNavigate();

  return useCallback(() => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}
