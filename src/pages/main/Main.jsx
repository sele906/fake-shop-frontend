import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Main.module.css";
import { getProducts, productImage, sortProducts } from "../../data/products";
import SortDropdown from "../../components/SortDropdown";
import usePrice from "../../lib/usePrice";
import useSortOptions from "../../lib/useSortOptions";

/* 상품이 1400개가 넘어서 메인에는 정렬한 앞쪽만 조금 깐다. */
const FEATURED_COUNT = 24;

export default function Main() {
  const { t } = useTranslation("main");
  const price = usePrice();
  const sorts = useSortOptions();
  const [sortKey, setSortKey] = useState(sorts[0].key);

  const featured = useMemo(
    () => sortProducts(getProducts(), sortKey).slice(0, FEATURED_COUNT),
    [sortKey]
  );

  return (
    <>
      <section className={styles.hero}>
        <span className={styles.heroKicker}>{t("hero.kicker")}</span>

        <h1>
          {t("hero.titleLine1")}
          <br />
          {t("hero.titleLine2")}
        </h1>

        <p>{t("hero.lead")}</p>

        <div className={styles.heroCta}>
          <Link className={styles.btn} to="/promo/weekly">
            {t("hero.ctaPrimary")}
          </Link>
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/coupon">
            {t("hero.ctaSecondary")}
          </Link>
        </div>
      </section>

      <div className={styles.toolbar}>
        <h2>
          {t("toolbar.title")}{" "}
          <small>{t("toolbar.tempting", { count: getProducts().length })}</small>
        </h2>

        <nav className={styles.sorts} aria-label={t("sortAria")}>
          {sorts.map((sort) => (
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
        <SortDropdown options={sorts} value={sortKey} onChange={setSortKey} />
      </div>

      <section className={styles.grid} aria-label={t("gridAria")}>
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

              <span className={styles.cardPrice}>{price(product.price)}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
