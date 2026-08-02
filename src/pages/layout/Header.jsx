import { useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./Layout.module.css";
import { useCart } from "../../cart/CartProvider";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";
import { MISSION } from "../../coupon/hiddenStorage";

import { BiCart, BiMenu } from "react-icons/bi";

/* 로고 연타로 인정하는 간격. 이보다 뜸해지면 처음부터 다시 센다. */
const LOGO_GAP_MS = 1200;
const LOGO_HITS = 5;

export default function Header({ isNavOpen, onToggleNav }) {
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
          aria-label="카테고리 열기"
          aria-expanded={isNavOpen}
          aria-controls="sidebar"
          onClick={onToggleNav}
        >
          <BiMenu size={24} aria-hidden="true" />
        </button>

        <Link className={styles.brand} to="/" onClick={handleBrandClick}>
          안삼 <span>STORE</span>
        </Link>
      </div>

      <Link
        className={styles.iconBtn}
        to="/cart"
        aria-label={`장바구니 ${count}개`}
      >
        <BiCart size={20} aria-hidden="true" />
        {count > 0 && <span className={styles.badge}>{count}</span>}
      </Link>

      <nav className={styles.utils} aria-label="사용자 메뉴">
        <Link to="/login">로그인하는 척</Link>
        <Link to="/cart" className={styles.cart}>
          안 살 것들
          {count > 0 && <span className={styles.badge}>{count}</span>}
        </Link>
      </nav>
    </header>
  );
}
