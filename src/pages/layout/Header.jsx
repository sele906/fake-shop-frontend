import { Link } from "react-router-dom";
import styles from "./Layout.module.css";
import { useCart } from "../../cart/CartProvider";

import { BiCart, BiMenu, BiSearch } from "react-icons/bi";

export default function Header({ isNavOpen, onToggleNav }) {
  const { count } = useCart();

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

        <Link className={styles.brand} to="/">
          안삼 <span>STORE</span>
        </Link>

        {/* <form
          className={styles.search}
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="search"
            placeholder="검색이나 해보기"
            aria-label="상품 검색"
          />
          <BiSearch size={16} aria-hidden="true" />
        </form> */}
      </div>

      {/* <button type="button" className={styles.iconBtn} aria-label="검색">
        <BiSearch size={20} aria-hidden="true" />
      </button> */}

      <Link
        className={styles.iconBtn}
        to="/cart"
        aria-label={`장바구니 ${count}개`}
      >
        <BiCart size={20} aria-hidden="true" />
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
