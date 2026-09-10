import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import styles from "./Onboarding.module.css";
import emptyBox from "../assets/emptyBox.png";

/* Layout.jsx의 드로어 판정과 같은 문자열. 한 앱에서 "모바일"의 경계가
   두 개면 안 된다. index.css의 Breakpoints 주석에 있는 md 900px이다. */
const MOBILE_QUERY = "(max-width:900px)";

/* 저장은 다른 저장 코드와 같은 ansam.* 규칙을 따른다. 값은 봤다는 사실
   하나뿐이라 JSON을 두지 않는다 — 구조가 생기면 그때 v2로 올린다. */
const SEEN_KEY = "ansam.onboarding.v1";

/**
 * 이 화면을 띄울지 판단한다.
 *
 * 데스크톱에서는 아무것도 하지 않는다 — 띄우지 않을 뿐 아니라 봤다는 기록도
 * 남기지 않는다. PC로 먼저 둘러본 사람이 폰으로 열면 그때 처음 뜬다.
 */
function shouldShow() {
  if (!window.matchMedia(MOBILE_QUERY).matches) return false;

  try {
    return window.localStorage.getItem(SEEN_KEY) !== "1";
  } catch (error) {
    /* 시크릿 모드 등 저장소를 못 읽는 환경. 읽지 못하면 처음 온 것으로 본다 —
       이 화면은 "여기서는 결제가 일어나지 않는다"를 알리는 자리라,
       두 번 보는 쪽이 한 번도 못 보는 쪽보다 낫다. */
    console.error("온보딩 기록을 읽지 못했습니다.", error);
    return true;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch (error) {
    /* 용량 초과 · 시크릿 모드. 저장만 실패하고 화면은 계속 쓸 수 있어야 한다. */
    console.error("온보딩 기록을 저장하지 못했습니다.", error);
  }
}

/**
 * 첫 방문 때 한 번 덮이는 안내 화면. 모바일에서만 나온다.
 *
 * 테스터들이 "왜 가짜 쇼핑몰인지 모르겠다"고 한 데서 나왔다. 그래서 문구가
 * 지켜야 하는 것이 둘 있다 — 충동구매를 대신 푸는 곳이라는 것과, 결제가
 * 실제로 일어나지 않는다는 것. 문구를 손볼 때 이 둘은 남겨야 한다.
 *
 * 뜰지 말지는 마운트 때 한 번만 정한다. 데스크톱 브라우저를 900px 아래로
 * 줄여도 새로고침 전에는 나타나지 않는다 — 창을 줄이는 중에 화면이 통째로
 * 덮이는 편이 더 놀랍다.
 *
 * 화면 위치는 예외다. 영수증에서는 뜨지 않고, 거기서 가게로 넘어오면 그때
 * 뜬다. 그래서 경로만 마운트 때 굳히지 않고 매번 다시 본다.
 */
export default function Onboarding() {
  const { t } = useTranslation("onboarding");
  const { pathname } = useLocation();
  const startRef = useRef(null);

  /* 들고 있는 것은 "닫혔는가"다. 뜰 자격(모바일 · 처음)은 마운트 때 한 번
     정해지고, 지금 뜰 자리인가는 아래에서 경로로 매번 다시 본다. */
  const [isDismissed, setIsDismissed] = useState(() => !shouldShow());

  /**
   * 공유 링크로 열린 영수증은 남의 결제 결과를 보러 온 자리다. 가게에 처음
   * 온 사람에게 하는 설명이 그 위를 먼저 덮으면 링크를 보낸 쪽의 화면이 아니라
   * 우리 안내가 첫 화면이 된다. 이 화면에는 헤더도 언어 토글도 없다.
   *
   * 여기서 가게로 넘어가면 그때 뜬다 — 자격은 아직 살아 있다.
   */
  const isOpen = !isDismissed && pathname !== "/receipt";

  /* 기록은 닫을 때 남긴다. 뜨는 순간에 남기면 읽기 전에 앱을 닫은 사람에게
     다시 뜨지 않는다. */
  const close = useCallback(() => {
    markSeen();
    setIsDismissed(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    /* 뒤 화면의 스크롤을 잠근다. 이 클래스는 useBackButton도 보고 있어서,
       안드로이드 뒤로가기가 아래 Escape 처리로 연결된다. */
    document.body.classList.add("modalOpen");

    startRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        close();
        return;
      }

      /* 안에 누를 수 있는 것이 버튼 하나뿐이라 가둘 목록도 필요 없다.
         그냥 두면 초점이 덮인 화면의 링크들로 빠져나간다. */
      if (event.key === "Tab") event.preventDefault();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modalOpen");
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.screen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboardingTitle"
    >
      <div className={styles.inner}>
        <div className={styles.header}>

          <h1 className={styles.title} id="onboardingTitle">
            <div className={styles.title1}>{t("title.one")}</div>
            <div className={styles.title2}>{t("title.two")}</div>
          </h1>
        </div>

        {/* 빈 상자. 문구가 이미 같은 말을 하고 있어 alt는 비운다 —
            여기에 설명을 넣으면 스크린리더가 같은 내용을 두 번 읽는다. */}
        <div className={styles.art}>
          <img src={emptyBox} alt="" />
        </div>

        <div className={styles.lead}>
          {/* 브랜드명은 문구에 박지 않고 넘긴다 — 한국어는 "안삼",
              영어는 "NOBUY"라 사전마다 다른 글자가 들어간다. */}
          <p>{t("lead.one", { brand: t("common:brand.name") })}</p>

          {/* 굵게 잡는 자리는 사전 안에 <b>로 있다. 강조가 걸리는 단어가
              언어마다 다른 자리에 오므로 JSX에서 자를 수 없다. */}
          <p>
            <Trans ns="onboarding" i18nKey="lead.two" components={{ b: <b /> }} />
          </p>

            <button
          type="button"
          ref={startRef}
          className={styles.start}
          onClick={close}
        >
          {t("start")}
        </button>
        </div>

        
      </div>
    </div>
  );
}
