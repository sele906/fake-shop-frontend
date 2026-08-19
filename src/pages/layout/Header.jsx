import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Layout.module.css";
import { useCart } from "../../cart/CartProvider";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";
import { MISSION } from "../../coupon/hiddenStorage";
import AccountMenu from "../../components/AccountMenu";

import { BiCart, BiMenu } from "react-icons/bi";

/* 로고 연타로 인정하는 간격. 이보다 뜸해지면 처음부터 다시 센다. */
const LOGO_GAP_MS = 1200;
const LOGO_HITS = 5;

export default function Header({ isNavOpen, onToggleNav }) {
  const { t } = useTranslation(["layout", "common"]);
  const { count } = useCart();
  const { unlock } = useHiddenCoupon();

  /* 눌린 횟수는 화면에 안 나오니 state로 두지 않는다. */
  const logoClicks = useRef({ count: 0, at: 0 });

  /* 로고는 홈으로 가는 링크다. 이동은 그대로 두고 횟수만 센다. */
  function handleBrandClick() {
    const now = Date.now();
    const { count: hits, at } = logoClicks.current;
    const next = now - at < LOGO_GAP_MS ? hits + 1 : 1;

    logoClicks.current = { count: next, at: now };

    if (next < LOGO_HITS) return;

    logoClicks.current = { count: 0, at: 0 };
    unlock(MISSION.LOGO_CLICK);
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          type="button"
          className={styles.hamburger}
          aria-label={t("header.openCategories")}
          aria-expanded={isNavOpen}
          aria-controls="sidebar"
          onClick={onToggleNav}
        >
          <BiMenu aria-hidden="true" />
        </button>

        <Link className={styles.brand} to="/" onClick={handleBrandClick}>
          {t("common:brand.name")} <span>{t("common:brand.suffix")}</span>
        </Link>
      </div>

      {/* 계정 → 장바구니 순서다. 장바구니가 결제로 가는 마지막 관문이라
          쇼핑몰에서는 대개 맨 오른쪽에 둔다.

          예전에는 900px 이상에서 장바구니가 "안 살 것들" 글자 링크(.utils)로,
          이하에서는 아이콘으로 바뀌었다. 계정이 아이콘으로 들어오면서 같은
          줄에 글자와 아이콘이 섞여 두 조작이 다른 종류로 보였다. 폭에 상관없이
          아이콘 둘로 통일했다. */}
      <AccountMenu />

      <Link
        className={styles.iconBtn}
        to="/cart"
        aria-label={t("header.cartAria", { count })}
      >
        <BiCart aria-hidden="true" />
        {count > 0 && <span className={styles.badge}>{count}</span>}
      </Link>
    </header>
  );
}
