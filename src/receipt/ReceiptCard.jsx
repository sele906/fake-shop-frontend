import styles from "./ReceiptCard.module.css";
import { won } from "../data/products";

/**
 * 절약 영수증. 결제 완료 화면과 공유 링크 화면이 같은 것을 쓴다.
 *
 * receipt는 상품 데이터를 참조하지 않는 스냅샷이다.
 *   { date, total, payName, note, grade, itemCount, items: [{ name, qty }] }
 */
export default function ReceiptCard({ receipt }) {
  const { date, total, payName, note, grade, itemCount, items } = receipt;

  /* 링크로 온 영수증은 상품 줄이 잘려 있을 수 있다. */
  const hiddenCount = Math.max(0, (itemCount ?? items.length) - items.length);

  return (
    <>
      <div className={styles.receipt}>
        <div className={styles.receiptHead}>
          <b>절약 영수증</b>
          <span>{date}</span>
        </div>

        {items.map(({ name, qty }, index) => (
          <div className={styles.receiptRow} key={`${name}-${index}`}>
            <span>
              {name}
              {qty > 1 ? ` ×${qty}` : ""}
            </span>
            <span>안 삼</span>
          </div>
        ))}

        {hiddenCount > 0 && (
          <div className={styles.receiptRow}>
            <span>그 외</span>
            <span>{hiddenCount}개 더 안 삼</span>
          </div>
        )}

        <div className={styles.receiptRow}>
          <span>결제수단</span>
          <span>{payName}</span>
        </div>

        <div className={styles.receiptRow}>
          <span>절제 방식</span>
          <span>{note}</span>
        </div>

        <div className={styles.receiptTotal}>
          <span>오늘 아낀 금액</span>
          <b>{won(total)}</b>
        </div>
      </div>

      <div className={styles.badges}>
        <span className={styles.badge}>🏅 이번에도 결제 안 함</span>
        <span className={styles.badge}>
          잔고 방어 +{total.toLocaleString("ko-KR")}
        </span>
        <span className={styles.badge}>{grade}</span>
      </div>
    </>
  );
}
