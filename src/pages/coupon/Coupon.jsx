import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Coupon.module.css";
import couponData from "../../data/coupon.json";
import useSavedCoupons from "../../coupon/useSavedCoupons";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";

const COUPON_TABS = [
  { id: "all", label: "전체 쿠폰" },
  { id: "basic", label: "기본 쿠폰" },
  { id: "today", label: "오늘의 쿠폰" },
  { id: "cart", label: "장바구니 쿠폰" },
  { id: "category", label: "카테고리 쿠폰" },
  { id: "suspicious", label: "수상한 쿠폰" },
];

const GROUP_LABELS = {
  basic: "기본 지급",
  today: "시간대·상황",
  cart: "장바구니 행동",
  category: "카테고리",
  suspicious: "말도 안 되는 고액",
};

/* 저장된 쿠폰은 손으로 고칠 수 있어서 모르는 group이 들어올 수 있다. */
function groupLabel(group) {
  return GROUP_LABELS[group] ?? "출처 불명";
}

/* 숨은 쿠폰은 목록에 깔지 않는다. 미션을 깨야 쿠폰함에 들어온다. */
const COUPONS = couponData.filter((coupon) => coupon.group !== "hidden");

export default function Coupon() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [savedCoupons, setSavedCoupons] = useSavedCoupons();
  const { hiddenCoupons, unlockedCount, isUnlocked } = useHiddenCoupon();
  const [rainRun, setRainRun] = useState(0);
  const [message, setMessage] = useState(
    "받은 쿠폰은 이 브라우저에만 저장됩니다."
  );

  const visibleCoupons = useMemo(() => {
    if (activeTab === "all") return COUPONS;
    return COUPONS.filter((coupon) => coupon.group === activeTab);
  }, [activeTab]);

  const savedIds = useMemo(
    () => new Set(savedCoupons.map((coupon) => coupon.id)),
    [savedCoupons]
  );

  /* 이미 있는 쿠폰은 그대로 두고 새 것만 뒤에 붙인다. 몇 장이 늘었는지 돌려준다. */
  function saveCoupons(coupons) {
    const fresh = coupons.filter((coupon) => !savedIds.has(coupon.id));

    if (fresh.length) setSavedCoupons((current) => [...current, ...fresh]);

    return fresh.length;
  }

  function receiveCoupon(coupon) {
    if (savedIds.has(coupon.id)) {
      setMessage(`“${coupon.name}”은 이미 쿠폰함에 있습니다. 두 장이 되지는 않습니다.`);
      return;
    }

    saveCoupons([coupon]);
    setMessage(`“${coupon.name}” 획득! 쿠폰함에 저장했습니다.`);
  }

  function startCouponRain() {
    const todayCoupons = COUPONS.filter((coupon) => coupon.group === "today");
    const added = saveCoupons(todayCoupons);

    setRainRun((current) => current + 1);
    setMessage(
      added
        ? `쿠폰 비가 내립니다. ${added}장이 쿠폰함에 쌓였습니다.`
        : "오늘의 쿠폰은 이미 다 받으셨습니다. 비만 내립니다."
    );
  }

  function removeCoupon(coupon) {
    setSavedCoupons((current) =>
      current.filter((saved) => saved.id !== coupon.id)
    );
    setMessage(`“${coupon.name}”을 버렸습니다. 어차피 쓸 데도 없었습니다.`);
  }

  function clearWallet() {
    const count = savedCoupons.length;

    setSavedCoupons([]);
    setMessage(`${count}장을 전부 비웠습니다. 후회는 지금부터입니다.`);
  }

  function goToCart() {
    navigate("/cart");
  }

  return (
    <div className={styles.page}>
      {rainRun > 0 && (
        <div className={styles.rain} key={rainRun} aria-hidden="true">
          {Array.from({ length: 36 }, (_, index) => (
            <i
              key={index}
              style={{
                "--coupon-x": `${(index * 37) % 100}%`,
                "--coupon-delay": `${(index % 12) * 0.08}s`,
                "--coupon-spin": `${180 + (index % 5) * 90}deg`,
              }}
            />
          ))}
        </div>
      )}

      <header className={styles.hero}>
        <span className={styles.eyebrow}>COUPON WAREHOUSE</span>
        <h1>쿠폰 보관함</h1>

        <div className={styles.heroStats}>
          <div>
            <span>보유 쿠폰</span>
            <strong>{savedCoupons.length}장</strong>
          </div>
          <div>
            <span>예상 최대 할인율</span>
            <strong>438%</strong>
          </div>
        </div>

        <p>
          오늘도 안 샀으니 이미 100% 절약하셨습니다.
          <br />
          하지만 쿠폰은 별개니까 일단 받아두세요.
        </p>

        <div className={styles.heroActions}>
          <button type="button" onClick={startCouponRain}>
            오늘의 쿠폰 전부 받기
          </button>
        </div>
      </header>

      <p className={styles.status} role="status" aria-live="polite">
        {message}
      </p>

      <nav className={styles.tabs} aria-label="쿠폰 분류">
        {COUPON_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={styles.catalog} aria-labelledby="catalog-title">
        <div className={styles.sectionHead}>
          <div>
            <span>COUPON COLLECTION</span>
            <h2 id="catalog-title">
              쿠폰은 많을수록 좋고, 중복은 자유로울수록 좋습니다.
            </h2>
          </div>
          <p>{visibleCoupons.length}장의 쿠폰을 전시 중입니다.</p>
        </div>

        <div className={styles.couponGrid}>
          {visibleCoupons.map((coupon) => {
            const isSaved = savedIds.has(coupon.id);

            return (
              <article className={styles.couponCard} key={coupon.id}>
                <div className={styles.badges}>
                  <strong>중복 가능</strong>
                  <span>조건 없음</span>
                </div>
                <small>{groupLabel(coupon.group)}</small>
                <b>{coupon.benefit}</b>
                <h3>{coupon.name}</h3>
                <p>{coupon.description}</p>
                <dl>
                  <div>
                    <dt>최소 주문 금액</dt>
                    <dd>그런 거 없음</dd>
                  </div>
                  <div>
                    <dt>유효기간</dt>
                    <dd>마음이 식을 때까지</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  disabled={isSaved}
                  onClick={() => receiveCoupon(coupon)}
                >
                  {isSaved ? "쿠폰함에 있음" : "쿠폰 받기"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.achievements}>
        <div className={styles.sectionHead}>
          <div>
            <span>SECRET ACHIEVEMENTS</span>
            <h2>숨겨진 업적 쿠폰</h2>
          </div>
          <p>
            사이트 곳곳에서 쓸데없이 성실한 행동을 해보세요. {hiddenCoupons.length}개 중{" "}
            {unlockedCount}개를 찾으셨습니다.
          </p>
        </div>

        <div className={styles.achievementGrid}>
          {hiddenCoupons.map((coupon, index) => {
            const done = isUnlocked(coupon.id);
            const order = String(index + 1).padStart(2, "0");

            return (
              <article key={coupon.id} className={done ? styles.unlocked : undefined}>
                <span>
                  {done ? "UNLOCKED" : "LOCKED"} {order}
                </span>
                <h3>{coupon.mission ?? coupon.description}</h3>
                <p>
                  {coupon.name} {coupon.benefit}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.wallet} aria-labelledby="wallet-title">
        <div className={styles.sectionHead}>
          <div>
            <span>MY COUPON STORAGE</span>
            <h2 id="wallet-title">내 쿠폰함</h2>
          </div>
          <p>이 브라우저가 쿠폰 {savedCoupons.length}장을 기억하고 있습니다.</p>
        </div>

        {savedCoupons.length === 0 ? (
          <p className={styles.walletEmpty}>
            쿠폰함이 비었습니다. 위에서 아무거나 받아두세요. 어차피 쓸 곳은
            없지만 저장은 확실히 됩니다.
          </p>
        ) : (
          <>
            <ul className={styles.walletList}>
              {savedCoupons.map((coupon) => (
                <li key={coupon.id}>
                  <small>{groupLabel(coupon.group)}</small>
                  <b>{coupon.benefit}</b>
                  <h3>{coupon.name}</h3>
                  <p>{coupon.description}</p>
                  <button
                    type="button"
                    onClick={() => removeCoupon(coupon)}
                    aria-label={`${coupon.name} 삭제`}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.walletActions}>
              <button type="button" onClick={goToCart}>
                장바구니에서 확인하기
              </button>
              <button type="button" onClick={clearWallet}>
                전체 비우기
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
