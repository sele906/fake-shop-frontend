import { useTranslation } from "react-i18next";
import styles from "./ReceiptCard.module.css";
import usePrice from "../lib/usePrice";

/**
 * 절약 영수증. 결제 완료 화면과 공유 링크 화면이 같은 것을 쓴다.
 *
 * receipt는 상품 데이터를 참조하지 않는 스냅샷이다.
 *   { date, total, payName, note, grade, itemCount, items: [{ name, qty }] }
 *
 * payName · note · grade는 주문 시점의 언어로 찍힌 값이라 그대로 그린다.
 */
export default function ReceiptCard({ receipt }) {
  const { t } = useTranslation(["receipt", "common"]);
  const price = usePrice();
  const { date, total, payName, note, grade, itemCount, items } = receipt;

  /* 링크로 온 영수증은 상품 줄이 잘려 있을 수 있다. */
  const hiddenCount = Math.max(0, (itemCount ?? items.length) - items.length);

  return (
    <>
      <div className={styles.receipt}>
        <div className={styles.receiptHead}>
          <b>{t("card.title")}</b>
          <span>{date}</span>
        </div>

        {items.map(({ name, qty }, index) => (
          <div className={styles.receiptRow} key={`${name}-${index}`}>
            <span>
              {name}
              {qty > 1 ? ` ×${qty}` : ""}
            </span>
            <span>{t("card.notBought")}</span>
          </div>
        ))}

        {hiddenCount > 0 && (
          <div className={styles.receiptRow}>
            <span>{t("card.others")}</span>
            <span>{t("card.othersCount", { count: hiddenCount })}</span>
          </div>
        )}

        <div className={styles.receiptRow}>
          <span>{t("card.payMethod")}</span>
          <span>{payName}</span>
        </div>

        <div className={styles.receiptRow}>
          <span>{t("card.restraintStyle")}</span>
          <span>{note}</span>
        </div>

        <div className={styles.receiptTotal}>
          <span>{t("card.saved")}</span>
          <b>{price(total)}</b>
        </div>
      </div>

      <div className={styles.badges}>
        <span className={styles.badge}>{t("card.badgeNoPay")}</span>
        <span className={styles.badge}>
          {t("card.badgeDefended", {
            amount: total.toLocaleString(t("common:intlLocale")),
          })}
        </span>
        <span className={styles.badge}>{grade}</span>
      </div>
    </>
  );
}
