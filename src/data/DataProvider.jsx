import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DATA_FALLBACK_LANG, loadCoreData } from "./index";
import LoadingScreen from "../components/LoadingScreen";
import LoadFailedScreen from "../components/LoadFailedScreen";

/**
 * 상품 · 카테고리 · 쿠폰을 지금 언어로 받아 각 모듈에 채운 뒤에야 아래를 그린다.
 *
 * 이 문턱 덕분에 findProduct · getCategories 같은 함수들이 화면에서는
 * 전부 동기로 남는다. 데이터가 없는 상태로 그려질 일이 없기 때문이다.
 *
 * 언어를 바꾸면 다른 파일을 받아야 하므로 로딩 화면이 다시 한 번 뜨고,
 * 아래 트리는 통째로 새로 그려진다. 오래된 언어의 값이 useMemo 같은 데
 * 남아 있을 여지를 없애려는 것이다. 장바구니는 상품 id로 저장하고 id는
 * 두 언어가 같아서, 다시 그려져도 담아둔 것은 그대로 살아난다.
 */
export default function DataProvider({ children }) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? DATA_FALLBACK_LANG;

  const [readyLang, setReadyLang] = useState(null);
  const [error, setError] = useState(null);
  /* "다시 시도"를 누르면 이 값이 올라가면서 effect가 한 번 더 돈다. */
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;

    setError(null);

    loadCoreData(lang)
      .then(() => {
        if (alive) setReadyLang(lang);
      })
      .catch((loadError) => {
        console.error("상품 데이터를 받지 못했습니다.", loadError);
        if (alive) setError(loadError);
      });

    return () => {
      alive = false;
    };
  }, [lang, attempt]);

  if (error) {
    return <LoadFailedScreen onRetry={() => setAttempt((n) => n + 1)} />;
  }

  if (readyLang !== lang) return <LoadingScreen />;

  return children;
}
