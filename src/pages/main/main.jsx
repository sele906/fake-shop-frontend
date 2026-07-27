import { useCallback, useEffect, useState } from "react";
import styles from "./main.module.css";
import { getMenuCategories } from "../../api/api";

import {
  BiCaretDown,
  BiCaretRight,
  BiCart,
  BiMenu,
  BiSearch,
  BiX,
} from "react-icons/bi";

const PROMOS = [
  "이번 주도 안 살 것들",
  "방금 들어온 척",
  "안삼이 괜히 골라봄",
];

const SORTS = [
  "왠지 끌리는 순",
  "방금 나온 척순",
  "통장에 덜 미안한 순",
  "남들이 많이 본 척순",
];

const PRODUCTS = [
  { id: 1, brand: "MUJIN", name: "리넨 커버 3종 세트", price: "89,000원", tag: "안삼 셀렉트" },
  { id: 2, brand: "HAAT", name: "무광 스테인리스 주전자 1.2L", price: "54,000원", tag: "" },
  { id: 3, brand: "ONDO", name: "접이식 원목 사이드 테이블", price: "128,000원", tag: "왠지 인기 많음" },
  { id: 4, brand: "BAEK", name: "오버사이즈 코튼 셔츠", price: "69,000원", tag: "MD도 놀란 특가" },
  { id: 5, brand: "SORI", name: "무선 이어폰 2세대", price: "179,000원", tag: "" },
  { id: 6, brand: "GEUL", name: "데스크 조명 · 웜화이트", price: "96,000원", tag: "구경만 해도 됨" },
  { id: 7, brand: "PYEON", name: "드립 커피 원두 500g", price: "19,800원", tag: "일단 품절 임박" },
  { id: 8, brand: "DAM", name: "수납 바스켓 라지", price: "32,000원", tag: "" },
  { id: 9, brand: "NAL", name: "스테인리스 식기 4인 세트", price: "74,000원", tag: "오늘출발(예정)" },
  { id: 10, brand: "MUJIN", name: "워시드 코튼 이불커버", price: "112,000원", tag: "" },
  { id: 11, brand: "HAAT", name: "주철 프라이팬 26cm", price: "88,000원", tag: "무료배송" },
  { id: 12, brand: "ONDO", name: "월넛 벽선반 60cm", price: "58,000원", tag: "" },
];

const MOBILE_QUERY = "(max-width:900px)";

export default function Main() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryStatus, setCategoryStatus] = useState("loading");
  const [expandedCode, setExpandedCode] = useState(null);
  const [activeCode, setActiveCode] = useState(null);
  const [activePromo, setActivePromo] = useState(PROMOS[2]);
  const [activeSort, setActiveSort] = useState(SORTS[0]);

  const closeNav = useCallback(() => setIsNavOpen(false), []);

  const loadCategories = useCallback(async (signal) => {
    try {
      setCategoryStatus("loading");

      const data = await getMenuCategories(signal);
      if (signal?.aborted) return;

      setCategories(data);
      setCategoryStatus("ready");

      /* 첫 대분류를 기본으로 펼쳐 둔다. */
      if (data.length > 0) {
        setExpandedCode(data[0].code);
        setActiveCode(data[0].code);
      }
    } catch (error) {
      if (signal?.aborted) return;

      console.error(error);
      setCategoryStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadCategories(controller.signal);

    return () => controller.abort();
  }, [loadCategories]);

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

  /* 대분류: 하위가 있으면 펼치기만, 없으면 바로 선택한다. */
  function handleCategoryClick(category) {
    setActiveCode(category.code);

    if (category.children.length === 0) {
      closeNavOnMobile();
      return;
    }

    setExpandedCode((current) =>
      current === category.code ? null : category.code
    );
  }

  function handleSubCategoryClick(child) {
    setActiveCode(child.code);
    closeNavOnMobile();
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
            <BiMenu size={24} aria-hidden="true" />
          </button>

          <div className={styles.brand}>
            안삼 <span>STORE</span>
          </div>

          <form
            className={styles.search}
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <BiSearch size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder="검색이나 해보기"
              aria-label="상품 검색"
            />
          </form>
        </div>

        <button type="button" className={styles.iconBtn} aria-label="검색">
          <BiSearch size={20} aria-hidden="true" />
        </button>

        <button type="button" className={styles.iconBtn} aria-label="장바구니 3개">
          <BiCart size={20} aria-hidden="true" />
        </button>

        <nav className={styles.utils} aria-label="사용자 메뉴">
          <a href="#login">로그인만 해두기</a>
          <a href="#orders">안 산 내역</a>
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
              <BiX size={24} aria-hidden="true" />
            </button>
          </div>

          <nav className={styles.catList} aria-label="카테고리">
            <div className={`${styles.eyebrow} ${styles.catHead}`}>카테고리</div>

            {categoryStatus === "loading" && (
              <p className={styles.catMsg}>상품 없는 선반 정리 중…</p>
            )}

            {categoryStatus === "error" && (
              <p className={styles.catMsg}>
                카테고리가 출근을 거부했습니다.
                <br />
                <button
                  type="button"
                  className={styles.catRetry}
                  onClick={() => loadCategories()}
                >
                  억지로 출근시키기
                </button>
              </p>
            )}

            {categoryStatus === "ready" &&
              categories.map((category) => {
                const hasChildren = category.children.length > 0;
                const isExpanded = expandedCode === category.code;

                return (
                  <div key={category.code}>
                    <button
                      type="button"
                      className={`${styles.cat} ${styles.catToggle}`}
                      aria-current={activeCode === category.code || undefined}
                      aria-expanded={hasChildren ? isExpanded : undefined}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category.name}
                      {hasChildren && (
                        <em>
                          {isExpanded ? (
                            <BiCaretDown aria-hidden="true" />
                          ) : (
                            <BiCaretRight aria-hidden="true" />
                          )}
                        </em>
                      )}
                    </button>

                    {hasChildren && isExpanded && (
                      <div className={styles.subList}>
                        {category.children.map((child) => (
                          <a
                            key={child.code}
                            className={styles.subCat}
                            href={`#category-${child.code}`}
                            aria-current={
                              activeCode === child.code || undefined
                            }
                            onClick={() => handleSubCategoryClick(child)}
                          >
                            {child.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
              회원인 척 시작하기
            </a>
          </div>
        </aside>

        <main className={styles.main}>
          <section className={styles.hero}>
            <span className={styles.heroKicker}>여긴 안 사는 쇼핑몰입니다</span>

            <h1>
              마음껏 담고
              <br />
              끝까지 구경하세요
            </h1>

            <p>
              하지만 실제 결제도, 실제 배송도 없습니다.
            </p>

            <div className={styles.heroCta}>
              <a className={styles.btn} href="#exhibition">
                일단 담으러 가기
              </a>
              <a
                className={`${styles.btn} ${styles.btnGhost}`}
                href="#coupon"
              >
                쿠폰 있는 것처럼 굴기
              </a>
            </div>
          </section>

          <div className={styles.toolbar}>
            <h2>
              다들 괜히 보고 있음 <small>{PRODUCTS.length}개가 유혹 중</small>
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

            <span className={styles.sortSelect}>
              {activeSort} <BiCaretDown aria-hidden="true" />
            </span>
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
              사고 싶은 마음만 정성껏 모았습니다.
              <br />
              결제는 없고, 미련은 무료로 제공됩니다.
            </div>

            <nav>
              <strong>고객센터</strong>
              <a href="#faq">굳이 자주 묻는 질문</a>
              <a href="#delivery">없는 제품 배송 조회</a>
              <a href="#return">안 산 상품 반품하기</a>
            </nav>

            <nav>
              <strong>회사</strong>
              <a href="#about">제법 그럴듯한 회사 소개</a>
              <a href="#partner">입점 문의만 받아보기</a>
              <a href="#careers">채용 공고 구경하기</a>
            </nav>
          </footer>
        </main>
      </div>
    </>
  );
}
