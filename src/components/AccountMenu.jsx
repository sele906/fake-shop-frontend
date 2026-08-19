import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import styles from "./AccountMenu.module.css";
import useDismissable from "../hooks/useDismissable";
import { LANGUAGES } from "../i18n";

import { BiUser } from "react-icons/bi";

/* 언어 이름은 그 언어로 적는 것이 관례다. 어느 언어로 보든 똑같이 읽혀야 해서
   locales에 두지 않는다. */
const NATIVE_LABEL = { ko: "한국어", en: "English" };

const THEMES = ["light", "dark"];

/* index.css의 --bg와 같은 값. 브라우저 주소창에 칠해진다.
   안드로이드의 짝은 res/values/colors.xml의 @color/appBg다 — 거기는 창 배경이라
   상태바 뒤에 비치고, 여기는 주소창이다. 세 값이 어긋나면 띠가 생긴다. */
const BAR = { light: "#f4f5f7", dark: "#1b1e23" };

/* android/app/src/main/java/com/ansam/app/ThemePlugin.java */
const Theme = registerPlugin("Theme");

/**
 * 화면 바깥 테두리 색을 웹 테마에 맞춘다 — 브라우저 주소창과 앱 상태바.
 *
 * 둘 다 CSS가 닿지 않는 자리라 토글이 직접 바꿔야 한다. theme-color는 media
 * 속성으로 나눌 수 있지만 그러면 버튼으로 고른 값이 아니라 OS 설정을 따라간다.
 *
 * 상태바는 색을 직접 못 정한다. targetSdk 35부터 엣지투엣지가 강제라
 * android:statusBarColor도 StatusBar.setBackgroundColor()도 무시되고, 상태바는
 * 투명해져 그 뒤의 창 배경이 비친다. 그래서 색이 아니라 나이트 모드를 보낸다 —
 * ThemePlugin이 AppCompatDelegate로 리소스 설정을 바꾸면 values-night의 창
 * 배경이 앱이 고른 테마를 따라온다.
 *
 * 아이콘 색은 별개다. Style.Light은 "글자를 밝게"라는 뜻이라 어두운 배경에 쓴다.
 * XML의 windowLightStatusBar("배경이 밝다")와 뜻이 반대다.
 */
function syncChrome(theme) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", BAR[theme]);

  if (!Capacitor.isNativePlatform()) return;

  Theme.setNightMode({ mode: theme }).catch(() => {});
  StatusBar.setStyle({
    style: theme === "dark" ? Style.Light : Style.Dark,
  }).catch(() => {});
}

/**
 * 헤더의 계정 메뉴. 로그인 · 화면(라이트/다크) · 언어를 담는다.
 *
 * 셋을 한 버튼으로 묶은 것은 두 가지 이유다.
 *
 * 하나는 모바일 헤더 폭이다. 360px에서 좌우 패딩과 햄버거 · 장바구니를 빼면
 * 브랜드에 78px밖에 안 남는데 "안삼 STORE"가 91px이라, 언어 토글(약 70px)과
 * 테마 버튼(44px)을 따로 두면 넘친다. 아이콘 하나로 합치면 82px이 돌아온다.
 *
 * 다른 하나는 로그인이 흩어져 있던 것이다. 헤더 .utils와 사이드바 드로어
 * 바닥에 하나씩 있었고 한국어 문구까지 서로 달랐다("로그인하는 척" /
 * "로그인 척하기"). 게다가 사이드바는 Layout 라우트 8개에만 있어서, 나머지
 * 화면에서는 900px 이하에서 로그인 입구가 아예 없었다.
 *
 * 여닫는 규칙(바깥클릭 · Escape · 포커스 복귀)은 useDismissable이 갖고 있고
 * Select와 나눠 쓴다. 이 패널은 값을 고르는 listbox가 아니라 컨트롤을 담는
 * 상자라서 combobox 의미를 쓰지 않는다 — 안의 두 묶음이 각자 radiogroup이다.
 *
 * 라디오는 네이티브 <input type="radio">다. 화살표 키 이동 · 묶음 · 라벨 연결이
 * 전부 딸려 오므로 aria-pressed 버튼으로 흉내 내는 것보다 정확하고 짧다.
 */
export default function AccountMenu() {
  const { t, i18n } = useTranslation("layout");
  const { isOpen, open, close, wrapRef, triggerRef, onKeyDown } =
    useDismissable();

  const panelId = useId();
  const themeName = useId();
  const langName = useId();

  /* 첫 값은 index.html의 부팅 스크립트가 이미 정해 둔 <html>에서 읽는다.
     여기서 localStorage를 다시 읽으면 판정이 두 벌이 된다. */
  const [theme, setThemeState] = useState(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  /* 저장된 선택이 OS 설정과 다를 수 있어 뜰 때 한 번 맞춘다. 부팅 스크립트는
     <html>만 건드리고 네이티브에는 손이 닿지 않는다.
     이 컴포넌트는 헤더마다 있어 페이지를 옮길 때도 다시 도는데, 같은 값을 다시
     넣는 것뿐이라 그대로 둔다. 계정 메뉴가 없는 /receipt에서는 안 돈다. */
  useEffect(() => {
    syncChrome(theme);
  }, [theme]);

  /* "en-US"로 감지됐을 수 있어 앞부분만 본다. i18n.js의 load: "languageOnly"와 짝이다. */
  const language = i18n.resolvedLanguage ?? i18n.language?.split("-")[0];

  function pickTheme(next) {
    setThemeState(next);

    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;

    try {
      localStorage.setItem("ansamTheme", next);
    } catch {
      /* 저장이 안 돼도 이번 세션에는 적용된 상태로 둔다. */
    }
  }

  return (
    <div className={styles.wrap} ref={wrapRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        /* aria-haspopup은 쓰지 않는다. "true"는 menu와 같은 뜻이라 스크린리더를
           메뉴 모드로 들여보내는데, 이 패널은 명령이 아니라 라디오 두 묶음을
           담는 영역이다. 버튼이 영역을 펴고 접는 disclosure 그대로 둔다. */
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={t("account.open")}
        onClick={() => (isOpen ? close() : open())}
      >
        <BiUser aria-hidden="true" />
      </button>

      {isOpen && (
        <div className={styles.panel} id={panelId}>
          {/* 눌러서 옮겨 가는 유일한 항목이라 라디오 묶음보다 위에 둔다. */}
          <Link className={styles.login} to="/login" onClick={() => close()}>
            {t("account.login")}
          </Link>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>{t("account.theme")}</legend>

            <div className={styles.seg}>
              {THEMES.map((value) => (
                <label className={styles.opt} key={value}>
                  <input
                    type="radio"
                    name={themeName}
                    value={value}
                    checked={theme === value}
                    onChange={() => pickTheme(value)}
                  />
                  <span>{t(`account.${value}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>{t("account.language")}</legend>

            <div className={styles.seg}>
              {LANGUAGES.map((lang) => (
                <label className={styles.opt} key={lang} lang={lang}>
                  <input
                    type="radio"
                    name={langName}
                    value={lang}
                    checked={language === lang}
                    onChange={() => i18n.changeLanguage(lang)}
                  />
                  <span>{NATIVE_LABEL[lang]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
