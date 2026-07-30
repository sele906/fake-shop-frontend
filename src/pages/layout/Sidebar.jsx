import { useEffect, useState } from "react";
import { Link, useMatch } from "react-router-dom";
import styles from "./Layout.module.css";
import { CATEGORIES, getCategoryPath } from "../../data/categories";
import { productsInCategory } from "../../data/products";

import { BiCaretDown, BiCaretRight, BiX } from "react-icons/bi";

const PROMOS = [
  "이번 주도 안 살 것들",
  "방금 들어온 척",
  "안삼이 괜히 골라봄",
];

/* 카테고리 화면이 아닐 때(메인 등)는 첫 대분류를 펼쳐 둔다. */
const FIRST_CODE = CATEGORIES[0]?.code ?? null;

export default function Sidebar({ isOpen, onClose, onNavigate }) {
  /* 어느 칸을 보고 있는지는 주소에서 읽는다. 대분류·소분류 어느 쪽이든 받는다. */
  const match = useMatch("/category/:categoryCode");
  const path = getCategoryPath(match?.params.categoryCode);
  const topCode = path[0]?.code ?? null;
  const subCode = path[1]?.code ?? null;

  const [expandedCode, setExpandedCode] = useState(topCode ?? FIRST_CODE);
  const [activePromo, setActivePromo] = useState(PROMOS[2]);

  /* 다른 대분류로 이동하면 그 칸을 펼쳐 준다. */
  useEffect(() => {
    if (topCode) setExpandedCode(topCode);
  }, [topCode]);

  return (
    <aside
      id="sidebar"
      className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
    >
      <div className={styles.drawerHead}>
        <span className={styles.eyebrow}>카테고리</span>
        <button
          type="button"
          className={styles.drawerClose}
          aria-label="닫기"
          onClick={onClose}
        >
          <BiX size={24} aria-hidden="true" />
        </button>
      </div>

      {/* 대분류는 여닫기만 하고, 이동은 그 아래 "전체"와 소분류가 맡는다. */}
      <nav className={styles.catList} aria-label="카테고리">
        <div className={`${styles.eyebrow} ${styles.catHead}`}>카테고리</div>

        {CATEGORIES.map((category) => {
          const isExpanded = expandedCode === category.code;
          const isCurrent = topCode === category.code;

          return (
            <div key={category.code}>
              <button
                type="button"
                className={`${styles.cat} ${styles.catToggle}`}
                aria-current={isCurrent ? "page" : undefined}
                aria-expanded={isExpanded}
                onClick={() =>
                  setExpandedCode((current) =>
                    current === category.code ? null : category.code
                  )
                }
              >
                {category.name}
                <em>
                  {isExpanded ? (
                    <BiCaretDown aria-hidden="true" />
                  ) : (
                    <BiCaretRight aria-hidden="true" />
                  )}
                </em>
              </button>

              {isExpanded && (
                <div className={styles.subList}>
                  <Link
                    className={styles.subCat}
                    to={`/category/${category.code}`}
                    aria-current={
                      (isCurrent && subCode === null) || undefined
                    }
                    onClick={onNavigate}
                  >
                    전체 <em>{productsInCategory(category.code).length}</em>
                  </Link>

                  {category.children.map((child) => (
                    <Link
                      key={child.code}
                      className={styles.subCat}
                      to={`/category/${child.code}`}
                      aria-current={subCode === child.code || undefined}
                      onClick={onNavigate}
                    >
                      {child.name}{" "}
                      <em>{productsInCategory(child.code).length}</em>
                    </Link>
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
              onNavigate();
            }}
          >
            {promo}
          </a>
        ))}
      </nav>

      <div className={styles.drawerFoot}>
        <Link className={styles.btn} to="/login" onClick={onNavigate}>
          로그인 척하기
        </Link>
      </div>
    </aside>
  );
}
