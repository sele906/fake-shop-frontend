import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./Promo.module.css";
import { PRODUCTS, productImage, won } from "../../data/products";

/* 문구는 promo.json이 들고, 여기엔 목록에서 어디부터 자를지만 남긴다. */
const PROMOTIONS = [
  { id: "weekly", start: 0 },
  { id: "new", start: 12 },
  { id: "picked", start: 24 },
];

const PRODUCT_COUNT = 12;

export default function Promo() {
  const { t } = useTranslation("promo");
  const navigate = useNavigate();
  const { promoId } = useParams();
  const activePromo =
    PROMOTIONS.find((promotion) => promotion.id === promoId) ?? PROMOTIONS[2];
  const activeId = activePromo.id;

  const featuredProducts = PRODUCTS.slice(
    activePromo.start,
    activePromo.start + PRODUCT_COUNT
  );
  const coverProduct = featuredProducts[0];

  return (
    <div className={styles.page}>
      {/* 주석으로 남겨둔 초안. 살릴 때 문구는 promo.json으로 옮겨야 한다. */}
      {/* <header className={styles.heading}>
        <span>기획전</span>
        <h1>살 필요 없는 이유까지 준비했습니다</h1>
        <p>지금 아니어도 되지만, 지금 구경하면 조금 재미있는 목록입니다.</p>
      </header> */}

      <section
        id={`promo-${activePromo.id}`}
        className={styles.feature}
        aria-labelledby="promo-title"
      >
        <div className={styles.featureCopy}>
          <span className={styles.kicker}>{t(`${activeId}.kicker`)}</span>
          <h2 id="promo-title">
            {t(`${activeId}.title`)
              .split("\n")
              .map((line) => (
                <span key={line}>{line}</span>
              ))}
          </h2>
          <p>{t(`${activeId}.description`)}</p>
          <a href="#promo-products">{t("jumpToProducts")}</a>
        </div>

        {coverProduct && (
          <div className={styles.cover}>
            <img
              src={productImage(coverProduct.image, 900)}
              alt={coverProduct.image.alt || coverProduct.name}
            />
            <span>{t(`${activeId}.label`)}</span>
          </div>
        )}
      </section>

      <nav className={styles.tabs} aria-label={t("tabsAria")}>
        {PROMOTIONS.map((promotion) => (
          <button
            key={promotion.id}
            type="button"
            aria-pressed={activeId === promotion.id}
            onClick={() => navigate(`/promo/${promotion.id}`)}
          >
            {t(`${promotion.id}.label`)}
          </button>
        ))}
      </nav>

      

      <section id="promo-products" className={styles.products}>
        <div className={styles.productHeading}>
          <h2>{t(`${activeId}.label`)}</h2>
          <p>{t("pickedCount", { count: featuredProducts.length })}</p>
        </div>

        <div className={styles.grid}>
          {featuredProducts.map((product) => (
            <article className={styles.card} key={product.id}>
              <Link className={styles.cardImage} to={`/product/${product.id}`}>
                <img
                  src={productImage(product.image)}
                  alt={product.image.alt || product.name}
                  loading="lazy"
                />
                {product.tag && <span>{product.tag}</span>}
              </Link>

              <div className={styles.cardMeta}>
                <small>{product.brand}</small>
                <Link to={`/product/${product.id}`}>{product.name}</Link>
                <strong>{won(product.price)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
