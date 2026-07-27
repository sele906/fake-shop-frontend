import { useCallback, useEffect, useState } from "react";
import styles from "./main.module.css";

const CATEGORIES = [
  { name: "리빙 · 생활", count: 412 },
  { name: "가전 · 디지털", count: 268 },
  { name: "의류 · 패션", count: 331 },
  { name: "식품 · 그로서리", count: 154 },
  { name: "뷰티 · 케어", count: 96 },
  { name: "문구 · 취미", count: 73 },
  { name: "반려 · 가든", count: 41 },
];

const PROMOS = ["이주의 특가", "신상품", "안삼 셀렉트"];

const SORTS = ["추천순", "신상품순", "낮은 가격순", "리뷰 많은순"];

const PRODUCTS = [
  { id: 1, brand: "MUJIN", name: "리넨 커버 3종 세트", price: "89,000원", tag: "안삼 셀렉트" },
  { id: 2, brand: "HAAT", name: "무광 스테인리스 주전자 1.2L", price: "54,000원", tag: "" },
  { id: 3, brand: "ONDO", name: "접이식 원목 사이드 테이블", price: "128,000원", tag: "" },
  { id: 4, brand: "BAEK", name: "오버사이즈 코튼 셔츠", price: "69,000원", tag: "NEW" },
  { id: 5, brand: "SORI", name: "무선 이어폰 2세대", price: "179,000원", tag: "" },
  { id: 6, brand: "GEUL", name: "데스크 조명 · 웜화이트", price: "96,000원", tag: "" },
  { id: 7, brand: "PYEON", name: "드립 커피 원두 500g", price: "19,800원", tag: "재입고" },
  { id: 8, brand: "DAM", name: "수납 바스켓 라지", price: "32,000원", tag: "" },
  { id: 9, brand: "NAL", name: "스테인리스 식기 4인 세트", price: "74,000원", tag: "" },
  { id: 10, brand: "MUJIN", name: "워시드 코튼 이불커버", price: "112,000원", tag: "" },
  { id: 11, brand: "HAAT", name: "주철 프라이팬 26cm", price: "88,000원", tag: "" },
  { id: 12, brand: "ONDO", name: "월넛 벽선반 60cm", price: "58,000원", tag: "" },
];

const MOBILE_QUERY = "(max-width:900px)";

function SearchIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CartIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export default function Main() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].name);
  const [activePromo, setActivePromo] = useState(PROMOS[2]);
  const [activeSort, setActiveSort] = useState(SORTS[0]);

  const closeNav = useCallback(() => setIsNavOpen(false), []);

  /* 드로어가 열려 있는 동안 배경 스크롤을 잠근다. */
  useEffect(() => {
    document.body.classList.toggle("navOpen", isNavOpen);

    return () => document.body.classList.remove("navOpen");
  }, [isNavOpen]);

  useEffect(() => {
    if (!isNavOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") closeNav();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isNavOpen, closeNav]);

  /* 모바일에서만 링크 선택 시 드로어를 닫는다. */
  function closeNavOnMobile() {
    if (window.matchMedia(MOBILE_QUERY).matches) closeNav();
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.hamburger}
            aria-label="카테고리 열기"
            aria-expanded={isNavOpen}
            aria-controls="sidebar"
            onClick={() => setIsNavOpen((open) => !open)}
          >
            <i />
            <i />
            <i />
          </button>

          <div className={styles.brand}>
            안삼 <span>STORE</span>
          </div>

          <form
            className={styles.search}
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <SearchIcon />
            <input
              type="search"
              placeholder="브랜드, 상품명으로 검색"
              aria-label="상품 검색"
            />
          </form>
        </div>

        <button type="button" className={styles.iconBtn} aria-label="검색">
          <SearchIcon size={20} />
        </button>

        <button type="button" className={styles.iconBtn} aria-label="장바구니 3개">
          <CartIcon />
        </button>

        <nav className={styles.utils} aria-label="사용자 메뉴">
          <a href="#login">로그인</a>
          <a href="#orders">주문내역</a>
          <a href="#cart" className={styles.cart}>
            장바구니 <span className={styles.badge}>3</span>
          </a>
        </nav>
      </header>

      <div
        className={`${styles.scrim} ${isNavOpen ? styles.open : ""}`}
        hidden={!isNavOpen}
        onClick={closeNav}
      />

      <div className={styles.shell}>
        <aside
          id="sidebar"
          className={`${styles.sidebar} ${isNavOpen ? styles.open : ""}`}
        >
          <div className={styles.drawerHead}>
            <span className={styles.eyebrow}>카테고리</span>
            <button
              type="button"
              className={styles.drawerClose}
              aria-label="닫기"
              onClick={closeNav}
            >
              ✕
            </button>
          </div>

          <nav className={styles.catList} aria-label="카테고리">
            <div className={`${styles.eyebrow} ${styles.catHead}`}>카테고리</div>

            {CATEGORIES.map((category) => (
              <a
                key={category.name}
                className={styles.cat}
                href={`#category-${category.name}`}
                aria-current={activeCategory === category.name || undefined}
                onClick={() => {
                  setActiveCategory(category.name);
                  closeNavOnMobile();
                }}
              >
                {category.name} <em>{category.count}</em>
              </a>
            ))}
          </nav>

          <nav className={styles.promo} aria-label="기획">
            <span className={styles.eyebrow}>기획</span>

            {PROMOS.map((promo) => (
              <a
                key={promo}
                href={`#promo-${promo}`}
                className={activePromo === promo ? styles.sel : undefined}
                onClick={() => {
                  setActivePromo(promo);
                  closeNavOnMobile();
                }}
              >
                {promo}
              </a>
            ))}
          </nav>

          <div className={styles.drawerFoot}>
            <a className={styles.btn} href="#login" onClick={closeNavOnMobile}>
              로그인 / 회원가입
            </a>
          </div>
        </aside>

        <main className={styles.main}>
          <section className={styles.hero}>
            <span className={styles.heroKicker}>2026 여름 정기 세일</span>

            <h1>
              필요한 것만
              <br />
              남긴 여름
            </h1>

            <p>
              생활, 가전, 의류 여섯 카테고리를 한 장바구니에서. 오늘까지 최대 40%
              할인.
            </p>

            <div className={styles.heroCta}>
              <a className={styles.btn} href="#exhibition">
                기획전 보기
              </a>
              <a
                className={`${styles.btn} ${styles.btnGhost}`}
                href="#coupon"
              >
                쿠폰 받기
              </a>
            </div>
          </section>

          <div className={styles.toolbar}>
            <h2>
              전체 상품 <small>1,248개</small>
            </h2>

            <nav className={styles.sorts} aria-label="정렬">
              {SORTS.map((sort) => (
                <a
                  key={sort}
                  href={`#sort-${sort}`}
                  aria-current={activeSort === sort || undefined}
                  onClick={() => setActiveSort(sort)}
                >
                  {sort}
                </a>
              ))}
            </nav>

            <span className={styles.sortSelect}>{activeSort} ▾</span>
          </div>

          <section className={styles.grid} aria-label="상품 목록">
            {PRODUCTS.map((product) => (
              <article className={styles.card} key={product.id}>
                <a
                  className={styles.cardImg}
                  href={`#product-${product.id}`}
                  aria-label={product.name}
                >
                  {product.tag && (
                    <span className={styles.tag}>{product.tag}</span>
                  )}
                </a>

                <div className={styles.cardMeta}>
                  <span className={styles.cardBrand}>{product.brand}</span>

                  <a className={styles.cardName} href={`#product-${product.id}`}>
                    {product.name}
                  </a>

                  <span className={styles.cardPrice}>{product.price}</span>
                </div>
              </article>
            ))}
          </section>

          <footer className={styles.footer}>
            <div>
              <strong>안삼 STORE</strong>
              생활에 필요한 것만 고릅니다.
              <br />
              평일 14시 이전 주문 당일 출고.
            </div>

            <nav>
              <strong>고객센터</strong>
              <a href="#faq">자주 묻는 질문</a>
              <a href="#delivery">배송 조회</a>
              <a href="#return">교환 · 반품</a>
            </nav>

            <nav>
              <strong>회사</strong>
              <a href="#about">브랜드 소개</a>
              <a href="#partner">입점 문의</a>
              <a href="#careers">채용</a>
            </nav>
          </footer>
        </main>
      </div>
    </>
  );
}
