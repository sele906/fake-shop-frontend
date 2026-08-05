import { useTranslation } from "react-i18next";
import styles from "./LoadingScreen.module.css";

/* 상품 데이터를 못 받았을 때. 빈 화면 대신 다시 시도할 자리를 준다. */
export default function LoadFailedScreen({ onRetry }) {
  const { t } = useTranslation("common");

  return (
    <div className={styles.screen} role="alert">
      <div className={styles.brand}>
        {t("brand.name")} <span>{t("brand.suffix")}</span>
      </div>

      <p className={styles.note}>
        <strong>{t("loadFailed.title")}</strong>
        <br />
        {t("loadFailed.lead")}
      </p>

      <button type="button" className={styles.retry} onClick={onRetry}>
        {t("loadFailed.retry")}
      </button>
    </div>
  );
}
