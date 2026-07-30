import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Main.module.css";
import { PRODUCTS, productImage, won } from "../../data/products";

import { BiCaretDown } from "react-icons/bi";

const SORTS = [
  "왠지 끌리는 순",
  "방금 나온 척순",
  "통장에 덜 미안한 순",
  "남들이 많이 본 척순",
];

/* 상품이 1600개가 넘어서 메인에는 앞에서 조금만 깐다. */
const FEATURED = PRODUCTS.slice(0, 24);

export default function Main() {
  const [activeSort, setActiveSort] = useState(SORTS[0]);

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
          <a className={styles.btn} href="#exhibition">
            일단 담으러 가기
          </a>
          <a className={`${styles.btn} ${styles.btnGhost}`} href="#coupon">
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

        {/* 모바일에는 탭을 늘어놓을 자리가 없어 드롭다운으로 고른다. */}
        <div className={styles.sortSelect}>
          <select
            value={activeSort}
            aria-label="정렬 기준"
            onChange={(event) => setActiveSort(event.target.value)}
          >
            {SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {sort}
              </option>
            ))}
          </select>

          <BiCaretDown aria-hidden="true" />
        </div>
      </div>

      <section className={styles.grid} aria-label="상품 목록">
        {FEATURED.map((product) => (
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
