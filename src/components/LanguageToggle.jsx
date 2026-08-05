import { useTranslation } from "react-i18next";
import styles from "./LanguageToggle.module.css";
import { LANGUAGES } from "../i18n";

/* 버튼에 찍는 글자. 어느 언어로 보든 똑같이 읽혀야 해서 locales에 두지 않는다. */
const SHORT_LABEL = { ko: "KO", en: "EN" };

/* 스크린리더가 읽을 이름. 각 언어를 그 언어로 적는 것이 관례다. */
const NATIVE_LABEL = { ko: "한국어", en: "English" };

/**
 * 한국어 ↔ 영어 토글.
 *
 * 고른 언어는 i18next-browser-languagedetector가 LocalStorage에 저장하므로
 * 여기서 따로 저장하지 않는다. 다음 방문에도 그대로 열린다.
 */
export default function LanguageToggle() {
  const { i18n } = useTranslation();

  /* "en-US"로 감지됐을 수 있어 앞부분만 본다. i18n.js의 load: "languageOnly"와 짝이다. */
  const current = i18n.resolvedLanguage ?? i18n.language?.split("-")[0];

  return (
    <div className={styles.toggle}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={current === lang}
          aria-label={NATIVE_LABEL[lang]}
          onClick={() => i18n.changeLanguage(lang)}
        >
          {SHORT_LABEL[lang]}
        </button>
      ))}
    </div>
  );
}
