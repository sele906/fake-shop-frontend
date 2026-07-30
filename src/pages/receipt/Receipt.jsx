import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const encoded = searchParams.get("d");

  const receipt = useMemo(() => decodeReceipt(encoded), [encoded]);

  if (!receipt) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1>읽을 수 없는 영수증입니다</h1>
          <p>
            링크가 중간에 잘렸거나, 영수증이 아닌 주소입니다.
            <br />
            직접 안 사고 새로 만드는 편이 빠릅니다.
          </p>

          <Link className={styles.btn} to="/">
            안 사러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <span className={styles.stamp}>안 삼 완료</span>

        <h1>
          이 사람은 오늘
          <br />
          아무것도 사지 않았습니다
        </h1>

        <p className={styles.lead}>
          자랑을 받으셨습니다. 
          <br />
          금액은 전부 통장에 그대로 남아 있습니다.
        </p>

        <ReceiptCard receipt={receipt} />

        <div className={styles.cta}>
          <Link className={styles.btn} to="/">
            나도 안 사러 가기
          </Link>

          <Link className={`${styles.btn} ${styles.ghost}`} to="/cart">
            장바구니만 채워보기
          </Link>
        </div>

        <p className={styles.tiny}>
          이 영수증은 링크 안에만 존재합니다. 저장된 곳은 어디에도 없습니다.
        </p>
      </div>
    </div>
  );
}
