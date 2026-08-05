import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Receipt.module.css";
import ReceiptCard from "../../receipt/ReceiptCard";
import { decodeReceipt } from "../../receipt/receiptLink";

/**
 * 남이 보낸 절약 영수증을 보는 화면.
 *
 * 서버가 없으므로 영수증 내용은 주소(?d=)에 통째로 들어 있다.
 * 상품 데이터를 참조하지 않아 products.json이 바뀌어도 옛 링크가 살아 있다.
 */
export default function Receipt() {
  const { t } = useTranslation("receipt");
  const [searchParams] = useSearchParams();
  const encoded = searchParams.get("d");

  const receipt = useMemo(() => decodeReceipt(encoded), [encoded]);

  if (!receipt) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1>{t("broken.title")}</h1>
          <p>
            {t("broken.leadLine1")}
            <br />
            {t("broken.leadLine2")}
          </p>

          <Link className={styles.btn} to="/">
            {t("broken.cta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <span className={styles.stamp}>{t("stamp")}</span>

        <h1>
          {t("titleLine1")}
          <br />
          {t("titleLine2")}
        </h1>

        <p className={styles.lead}>
          {t("leadLine1")}
          <br />
          {t("leadLine2")}
        </p>

        <ReceiptCard receipt={receipt} />

        <div className={styles.cta}>
          <Link className={styles.btn} to="/">
            {t("ctaPrimary")}
          </Link>

          <Link className={`${styles.btn} ${styles.ghost}`} to="/cart">
            {t("ctaSecondary")}
          </Link>
        </div>

        <p className={styles.tiny}>{t("tiny")}</p>
      </div>
    </div>
  );
}
