import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Main.module.css";
import {
  PRODUCTS,
  SORTS,
  productImage,
  sortProducts,
  won,
} from "../../data/products";
import SortDropdown from "../../components/SortDropdown";

/* 상품이 1400개가 넘어서 메인에는 정렬한 앞쪽만 조금 깐다. */
const FEATURED_COUNT = 24;

export default function Main() {
  const [sortKey, setSortKey] = useState(SORTS[0].key);

  const featured = useMemo(
    () => sortProducts(PRODUCTS, sortKey).slice(0, FEATURED_COUNT),
    [sortKey]
  );

  return (
    <>
      <section className={styles.hero}>
        <span className={styles.heroKicker}>여긴 안 사는 쇼핑몰입니다</span>

        <h1>
          마음껏 담고
          <br />
          끝까지 구경하세요
        </h1>

        <p>하지만 실제 결제도, 실제 배송도 없습니다.</p>

        <div className={styles.heroCta}>
          <Link className={styles.btn} to="/promo/weekly">
            일단 담으러 가기
          </Link>
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/coupon">
            쿠폰 있는 것처럼 굴기
          </Link>
        </div>
      </section>

      <div className={styles.toolbar}>
        <h2>
          다들 괜히 보고 있음 <small>{PRODUCTS.length}개가 유혹 중</small>
        </h2>

        <nav className={styles.sorts} aria-label="정렬">
          {SORTS.map((sort) => (
            <button
              key={sort.key}
              type="button"
              aria-current={sortKey === sort.key || undefined}
              onClick={() => setSortKey(sort.key)}
            >
              {sort.label}
            </button>
          ))}
        </nav>

        {/* 모바일에는 탭을 늘어놓을 자리가 없어 드롭다운으로 고른다. */}
        <SortDropdown options={SORTS} value={sortKey} onChange={setSortKey} />
      </div>

      <section className={styles.grid} aria-label="상품 목록">
        {featured.map((product) => (
          <article className={styles.card} key={product.id}>
            <Link
              className={styles.cardImg}
              to={`/product/${product.id}`}
              aria-label={product.name}
            >
              <img
                src={productImage(product.image)}
                alt={product.image.alt || product.name}
                loading="lazy"
              />

              {/* 태그는 이미지 위에 얹히므로 img 뒤에 둔다. */}
              {product.tag && <span className={styles.tag}>{product.tag}</span>}
            </Link>

            <div className={styles.cardMeta}>
              <span className={styles.cardBrand}>{product.brand}</span>

              <Link className={styles.cardName} to={`/product/${product.id}`}>
                {product.name}
              </Link>

              <span className={styles.cardPrice}>{won(product.price)}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
