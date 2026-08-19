import { useEffect, useState } from "react";
import { Link, useMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Layout.module.css";
import { getCategories, getCategoryPath } from "../../data/categories";
import { productsInCategory } from "../../data/products";

import { BiCaretDown, BiCaretRight, BiX } from "react-icons/bi";

/* 주소의 :promoId와 그대로 맞물린다. 표시할 이름은 layout.json의 sidebar.promo에서 읽는다. */
const PROMO_IDS = ["weekly", "new", "picked"];

export default function Sidebar({ isOpen, onClose, onNavigate }) {
  const { t } = useTranslation("layout");

  /* 데이터는 DataProvider가 채운 뒤라 여기서는 그냥 읽으면 된다. */
  const categories = getCategories();

  /* 카테고리 화면이 아닐 때(메인 등)는 첫 대분류를 펼쳐 둔다. */
  const firstCode = categories[0]?.code ?? null;

  /* 어느 칸을 보고 있는지는 주소에서 읽는다. 대분류·소분류 어느 쪽이든 받는다. */
  const match = useMatch("/category/:categoryCode");
  const promoMatch = useMatch("/promo/:promoId");
  const path = getCategoryPath(match?.params.categoryCode);
  const topCode = path[0]?.code ?? null;
  const subCode = path[1]?.code ?? null;
  const activePromoId = promoMatch?.params.promoId ?? null;

  const [expandedCode, setExpandedCode] = useState(topCode ?? firstCode);

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
        <span className={styles.eyebrow}>{t("sidebar.categories")}</span>
        <button
          type="button"
          className={styles.drawerClose}
          aria-label={t("sidebar.close")}
          onClick={onClose}
        >
          <BiX aria-hidden="true" />
        </button>
      </div>

      {/* 대분류는 여닫기만 하고, 이동은 그 아래 "전체"와 소분류가 맡는다. */}
      <nav className={styles.catList} aria-label={t("sidebar.categories")}>
        <div className={`${styles.eyebrow} ${styles.catHead}`}>
          {t("sidebar.categories")}
        </div>

        {categories.map((category) => {
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
                    {t("sidebar.all")}{" "}
                    <em>{productsInCategory(category.code).length}</em>
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

      <nav className={styles.promo} aria-label={t("sidebar.promoTitle")}>
        <span className={styles.eyebrow}>{t("sidebar.promoTitle")}</span>

        {PROMO_IDS.map((promoId) => (
          <Link
            key={promoId}
            to={`/promo/${promoId}`}
            className={activePromoId === promoId ? styles.sel : undefined}
            onClick={() => {
              onNavigate();
            }}
          >
            {t(`sidebar.promo.${promoId}`)}
          </Link>
        ))}
      </nav>

    </aside>
  );
}
