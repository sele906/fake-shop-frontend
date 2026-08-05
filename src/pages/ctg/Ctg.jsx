import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Ctg.module.css";
import { getCategoryPath } from "../../data/categories";
import {
  productImage,
  productsInCategory,
  sortProducts,
} from "../../data/products";
import SortDropdown from "../../components/SortDropdown";
import usePrice from "../../lib/usePrice";
import useSortOptions from "../../lib/useSortOptions";

export default function Ctg() {
  const { t } = useTranslation("ctg");
  const { categoryCode } = useParams();

  const price = usePrice();
  const sorts = useSortOptions();
  const [sortKey, setSortKey] = useState(sorts[0].key);
  const [isMoreDone, setIsMoreDone] = useState(false);

  /* 주소의 코드는 대분류일 수도, 소분류일 수도 있다.
     경로가 [대분류] 면 전체 보기, [대분류, 소분류] 면 그 소분류만 본다. */
  const path = getCategoryPath(categoryCode);
  const top = path[0] ?? null;
  const sub = path[1] ?? null;
  const current = sub ?? top;

  /* 카테고리를 옮기면 "더 보기"도 처음 상태로 돌린다. */
  useEffect(() => {
    setIsMoreDone(false);
  }, [categoryCode]);

  const products = useMemo(
    () => sortProducts(productsInCategory(current?.code), sortKey),
    [current?.code, sortKey]
  );

  /* 칩에 붙는 숫자. 소분류별로 한 번만 세어 둔다. */
  const subCounts = useMemo(() => {
    if (!top) return {};

    return Object.fromEntries(
      top.children.map((child) => [
        child.code,
        productsInCategory(child.code).length,
      ])
    );
  }, [top]);

  const totalCount = top ? productsInCategory(top.code).length : 0;

  if (!top) {
    return (
      <div className={styles.missing}>
        <h1>{t("missing.title")}</h1>
        <p>{t("missing.lead")}</p>
        <Link className={styles.btn} to="/">
          {t("missing.cta")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <nav className={styles.crumbs} aria-label={t("crumbsAria")}>
        <Link to="/">{t("home")}</Link>
        <span aria-hidden="true">/</span>

        {sub ? (
          <>
            <Link to={`/category/${top.code}`}>{top.name}</Link>
            <span aria-hidden="true">/</span>
            <span>{sub.name}</span>
          </>
        ) : (
          <span>{top.name}</span>
        )}
      </nav>

      <section className={styles.catHero}>
        <h1>
          {top.name} <small>{t("tempting", { count: totalCount })}</small>
        </h1>
        {/* 없는 코드면 기본 문구로 넘어간다. */}
        <p>{t([`notes.${top.code}`, "notes.default"])}</p>
      </section>

      {top.children.length > 0 && (
        <nav className={styles.subrail} aria-label={t("subrailAria")}>
          <Link
            to={`/category/${top.code}`}
            aria-current={sub === null || undefined}
          >
            {t("all")} <em>{totalCount}</em>
          </Link>

          {top.children.map((child) => (
            <Link
              key={child.code}
              to={`/category/${child.code}`}
              aria-current={sub?.code === child.code || undefined}
            >
              {child.name} <em>{subCounts[child.code]}</em>
            </Link>
          ))}
        </nav>
      )}

      <div className={styles.toolbar}>
        <h2>
          {current.name} <small>{t("count", { count: products.length })}</small>
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

      {products.length === 0 ? (
        <p className={styles.empty}>
          {t("empty.line1")}
          <br />
          {t("empty.line2")}
        </p>
      ) : (
        <>
          <section className={styles.grid} aria-label={t("gridAria")}>
            {products.map((product) => (
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
                  {product.tag && (
                    <span className={styles.tag}>{product.tag}</span>
                  )}
                </Link>

                <div className={styles.cardMeta}>
                  <span className={styles.cardBrand}>{product.brand}</span>

                  <Link
                    className={styles.cardName}
                    to={`/product/${product.id}`}
                  >
                    {product.name}
                  </Link>

                  <span className={styles.cardPrice}>
                    {price(product.price)}
                  </span>
                </div>
              </article>
            ))}
          </section>

          <div className={styles.more}>
            <button
              type="button"
              onClick={() => setIsMoreDone(true)}
              disabled={isMoreDone}
            >
              {isMoreDone ? t("more.done") : t("more.label")}
            </button>
          </div>
        </>
      )}
    </>
  );
}
