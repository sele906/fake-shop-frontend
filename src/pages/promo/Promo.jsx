import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./Promo.module.css";
import { PRODUCTS, productImage, won } from "../../data/products";

const PROMOTIONS = [
  {
    id: "weekly",
    label: "이번 주도 안 살 것들",
    kicker: "WEEKLY NOT-SHOPPING",
    title: "이번 주도\n눈으로만 골랐습니다",
    description:
      "사도 그만, 안 사도 그만인 물건을 이번 주의 핑계와 함께 모았습니다.",
    start: 0,
  },
  {
    id: "new",
    label: "방금 들어온 척",
    kicker: "JUST PRETENDING TO BE NEW",
    title: "처음 본 것처럼\n천천히 둘러보세요",
    description:
      "어디선가 본 듯하지만 방금 들어온듯이 진열된 상품들입니다.",
    start: 12,
  },
  {
    id: "picked",
    label: "안삼이 괜히 골라봄",
    kicker: "ANSAM'S USELESS PICKS",
    title: "안삼이 괜히\n마음에 담아봤습니다",
    description:
      "꼭 필요하지는 않지만 한 번 더 보고 싶은 것만 주관적으로 골랐습니다.",
    start: 24,
  },
];

const PRODUCT_COUNT = 12;

export default function Promo() {
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
          <span className={styles.kicker}>{activePromo.kicker}</span>
          <h2 id="promo-title">
            {activePromo.title.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <p>{activePromo.description}</p>
          <a href="#promo-products">괜히 골라보기</a>
        </div>

        {coverProduct && (
          <div className={styles.cover}>
            <img
              src={productImage(coverProduct.image, 900)}
              alt={coverProduct.image.alt || coverProduct.name}
            />
            <span>{activePromo.label}</span>
          </div>
        )}
      </section>

      <nav className={styles.tabs} aria-label="기획전 선택">
        {PROMOTIONS.map((promotion) => (
          <button
            key={promotion.id}
            type="button"
            aria-pressed={activeId === promotion.id}
            onClick={() => navigate(`/promo/${promotion.id}`)}
          >
            {promotion.label}
          </button>
        ))}
      </nav>

      

      <section id="promo-products" className={styles.products}>
        <div className={styles.productHeading}>
          <h2>{activePromo.label}</h2>
          <p>{featuredProducts.length}개를 골랐지만 하나도 사지 않아도 됩니다.</p>
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
