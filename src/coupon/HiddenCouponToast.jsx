import styles from "./HiddenCouponToast.module.css";

/**
 * 숨은 쿠폰을 처음 찾았을 때만 뜨는 알림.
 * 다른 토스트는 검정 판에 한 줄이라, 이것만 파란 판에 쿠폰 모양으로 띄운다.
 */
export default function HiddenCouponToast({ coupon }) {
  return (
    <div className={styles.toast}>
      <span className={styles.eyebrow}>SECRET COUPON UNLOCKED</span>

      <strong className={styles.name}>{coupon.name}</strong>

      <div className={styles.row}>
        <b className={styles.benefit}>{coupon.benefit}</b>
        <span>쿠폰함에 저장했습니다</span>
      </div>
    </div>
  );
}
