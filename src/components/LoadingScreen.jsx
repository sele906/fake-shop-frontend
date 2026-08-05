import { useTranslation } from "react-i18next";
import styles from "./LoadingScreen.module.css";

/**
 * 상품 · 카테고리 · 쿠폰 데이터를 받는 동안 보여 주는 화면.
 *
 * 첫 진입과 언어를 바꿀 때 잠깐 나온다. 문구는 locales에 있으므로
 * 사전이 먼저 올라와 있어야 하는데, i18n.js는 index.js에서 동기로 초기화하니
 * 이 화면이 그려질 때는 이미 준비돼 있다.
 */
export default function LoadingScreen() {
  const { t } = useTranslation("common");

  return (
    <div className={styles.screen} role="status" aria-live="polite">
      <div className={styles.brand}>
        {t("brand.name")} <span>{t("brand.suffix")}</span>
      </div>

      <div className={styles.bar} aria-hidden="true">
        <i />
      </div>

      <p className={styles.note}>{t("loading")}</p>
    </div>
  );
}
