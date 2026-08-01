import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./Ctg.module.css";
import { getCategoryPath } from "../../data/categories";
import {
  SORTS,
  productImage,
  productsInCategory,
  sortProducts,
  won,
} from "../../data/products";
import SortDropdown from "../../components/SortDropdown";

/* 대분류마다 한 줄. 없는 코드는 기본 문구로 넘어간다. */
const NOTES = {
  "0100": "옷장은 이미 꽉 찼는데 눈은 계속 이쪽으로 옵니다.",
  "0200": "성분표는 안 읽고 병 모양만 보고 담습니다.",
  "0300": "장바구니에선 늘 건강하게 먹습니다.",
  "0400": "없어도 잘 살았는데 보고 나면 필요해지는 것들.",
  "0500": "요리는 안 늘고 도구만 늘어납니다.",
  "0600": "집 구조는 못 바꾸니 장바구니만 바꿉니다.",
  "0700": "지금 쓰는 것도 멀쩡한데 왠지 느려 보입니다.",
  "0800": "쓸 데는 없고 모으는 재미만 있습니다.",
  "0900": "시작은 취미였고 지금은 수납 문제입니다.",
  "1000": "장비부터 갖추면 절반은 운동한 셈입니다.",
  "1100": "본인 물건보다 먼저 담기는 칸입니다.",
  "1200": "조카 준다는 명분이 제일 잘 통하는 칸입니다.",
};

const DEFAULT_NOTE = "구경만 해도 되는 칸입니다.";

export default function Ctg() {
  const { categoryCode } = useParams();

  const [sortKey, setSortKey] = useState(SORTS[0].key);
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
        <h1>없는 카테고리입니다</h1>
        <p>주소를 잘못 누르셨거나, 저희가 아직 안 만든 칸입니다.</p>
        <Link className={styles.btn} to="/">
          그냥 메인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <>
      <nav className={styles.crumbs} aria-label="경로">
        <Link to="/">홈</Link>
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
          {top.name} <small>{totalCount}개가 유혹 중</small>
        </h1>
        <p>{NOTES[top.code] ?? DEFAULT_NOTE}</p>
      </section>

      {top.children.length > 0 && (
        <nav className={styles.subrail} aria-label="하위 카테고리">
          <Link
            to={`/category/${top.code}`}
            aria-current={sub === null || undefined}
          >
            전체 <em>{totalCount}</em>
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
          {current.name} <small>{products.length}개</small>
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

      {products.length === 0 ? (
        <p className={styles.empty}>
          이 칸은 아직 텅 비었습니다.
          <br />
          안 사는 건 어느 칸에서나 가능하니 다른 칸도 둘러보세요.
        </p>
      ) : (
        <>
          <section className={styles.grid} aria-label="상품 목록">
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

                  <span className={styles.cardPrice}>{won(product.price)}</span>
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
              {isMoreDone ? "여기까지가 전부입니다" : "상품 더 보기"}
            </button>
          </div>
        </>
      )}
    </>
  );
}
