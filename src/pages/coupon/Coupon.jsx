import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Coupon.module.css";
import couponData from "../../data/coupon.json";
import useSavedCoupons from "../../coupon/useSavedCoupons";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";

const TAB_IDS = ["all", "basic", "today", "cart", "category", "suspicious"];

/* coupon.json의 group 값. 이 밖의 값은 "출처 불명"으로 떨어진다. */
const KNOWN_GROUPS = ["basic", "today", "cart", "category", "suspicious"];

/* 숨은 쿠폰은 목록에 깔지 않는다. 미션을 깨야 쿠폰함에 들어온다. */
const COUPONS = couponData.filter((coupon) => coupon.group !== "hidden");

export default function Coupon() {
  const { t } = useTranslation("coupon");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [savedCoupons, setSavedCoupons] = useSavedCoupons();
  const { hiddenCoupons, unlockedCount, isUnlocked } = useHiddenCoupon();
  const [rainRun, setRainRun] = useState(0);

  /* 문장이 아니라 무엇을 알릴지만 들고 있는다. 문장을 상태에 넣어 두면
     언어를 바꿨을 때 옛 언어의 안내가 그대로 남는다. */
  const [message, setMessage] = useState({ key: "msg.intro" });

  /* 저장된 쿠폰은 손으로 고칠 수 있어서 모르는 group이 들어올 수 있다. */
  function groupLabel(group) {
    return t(
      KNOWN_GROUPS.includes(group) ? `groups.${group}` : "groups.unknown"
    );
  }

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
      setMessage({ key: "msg.already", params: { name: coupon.name } });
      return;
    }

    saveCoupons([coupon]);
    setMessage({ key: "msg.got", params: { name: coupon.name } });
  }

  function startCouponRain() {
    const todayCoupons = COUPONS.filter((coupon) => coupon.group === "today");
    const added = saveCoupons(todayCoupons);

    setRainRun((current) => current + 1);
    setMessage(
      added
        ? { key: "msg.rain", params: { count: added } }
        : { key: "msg.rainNone" }
    );
  }

  function removeCoupon(coupon) {
    setSavedCoupons((current) =>
      current.filter((saved) => saved.id !== coupon.id)
    );
    setMessage({ key: "msg.removed", params: { name: coupon.name } });
  }

  function clearWallet() {
    const count = savedCoupons.length;

    setSavedCoupons([]);
    setMessage({ key: "msg.cleared", params: { count } });
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
        <span className={styles.eyebrow}>{t("hero.eyebrow")}</span>
        <h1>{t("hero.title")}</h1>

        <div className={styles.heroStats}>
          <div>
            <span>{t("hero.owned")}</span>
            <strong>
              {t("hero.ownedCount", { count: savedCoupons.length })}
            </strong>
          </div>
          <div>
            <span>{t("hero.maxDiscount")}</span>
            <strong>{t("hero.maxDiscountValue")}</strong>
          </div>
        </div>

        <p>
          {t("hero.leadLine1")}
          <br />
          {t("hero.leadLine2")}
        </p>

        <div className={styles.heroActions}>
          <button type="button" onClick={startCouponRain}>
            {t("hero.getToday")}
          </button>
        </div>
      </header>

      <p className={styles.status} role="status" aria-live="polite">
        {t(message.key, message.params)}
      </p>

      <nav className={styles.tabs} aria-label={t("tabsAria")}>
        {TAB_IDS.map((tabId) => (
          <button
            key={tabId}
            type="button"
            aria-pressed={activeTab === tabId}
            onClick={() => setActiveTab(tabId)}
          >
            {t(`tabs.${tabId}`)}
          </button>
        ))}
      </nav>

      <section className={styles.catalog} aria-labelledby="catalog-title">
        <div className={styles.sectionHead}>
          <div>
            <span>{t("catalog.eyebrow")}</span>
            <h2 id="catalog-title">{t("catalog.title")}</h2>
          </div>
          <p>{t("catalog.onDisplay", { count: visibleCoupons.length })}</p>
        </div>

        <div className={styles.couponGrid}>
          {visibleCoupons.map((coupon) => {
            const isSaved = savedIds.has(coupon.id);

            return (
              <article className={styles.couponCard} key={coupon.id}>
                <div className={styles.badges}>
                  <strong>{t("catalog.stackable")}</strong>
                  <span>{t("catalog.noCondition")}</span>
                </div>
                <small>{groupLabel(coupon.group)}</small>
                <b>{coupon.benefit}</b>
                <h3>{coupon.name}</h3>
                <p>{coupon.description}</p>
                <dl>
                  <div>
                    <dt>{t("catalog.minOrder")}</dt>
                    <dd>{t("catalog.minOrderValue")}</dd>
                  </div>
                  <div>
                    <dt>{t("catalog.validUntil")}</dt>
                    <dd>{t("catalog.validUntilValue")}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  disabled={isSaved}
                  onClick={() => receiveCoupon(coupon)}
                >
                  {isSaved ? t("catalog.saved") : t("catalog.receive")}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.achievements}>
        <div className={styles.sectionHead}>
          <div>
            <span>{t("achievements.eyebrow")}</span>
            <h2>{t("achievements.title")}</h2>
          </div>
          <p>
            {t("achievements.lead", {
              total: hiddenCoupons.length,
              found: unlockedCount,
            })}
          </p>
        </div>

        <div className={styles.achievementGrid}>
          {hiddenCoupons.map((coupon, index) => {
            const done = isUnlocked(coupon.id);
            const order = String(index + 1).padStart(2, "0");

            return (
              <article key={coupon.id} className={done ? styles.unlocked : undefined}>
                <span>
                  {done ? t("achievements.unlocked") : t("achievements.locked")}{" "}
                  {order}
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
            <span>{t("wallet.eyebrow")}</span>
            <h2 id="wallet-title">{t("wallet.title")}</h2>
          </div>
          <p>{t("wallet.lead", { count: savedCoupons.length })}</p>
        </div>

        {savedCoupons.length === 0 ? (
          <p className={styles.walletEmpty}>{t("wallet.empty")}</p>
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
                    aria-label={t("wallet.removeAria", { name: coupon.name })}
                  >
                    {t("wallet.remove")}
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.walletActions}>
              <button type="button" onClick={goToCart}>
                {t("wallet.goToCart")}
              </button>
              <button type="button" onClick={clearWallet}>
                {t("wallet.clearAll")}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
