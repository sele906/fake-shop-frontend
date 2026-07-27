import { useEffect, useMemo, useState } from "react";
import "./FakeShopPage.css";

const PRODUCT_API =
  "https://dummyjson.com/products" +
  "?limit=12" +
  "&select=id,title,description,price,discountPercentage,rating,stock,category,brand,thumbnail";

/**
 * DummyJSON 가격을 임시 원화 가격으로 변환한다.
 * 실제 환율 계산이 아니라 쇼핑몰 연출용이다.
 */
function toFakeWon(price) {
  return Math.round((price * 1300) / 100) * 100;
}

function getDiscountedPrice(product) {
  const originalPrice = toFakeWon(product.price);

  return Math.round(
    (originalPrice * (1 - product.discountPercentage / 100)) / 100
  ) * 100;
}

function formatWon(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function getProductBadge(product) {
  if (product.stock <= 5) return "일단 품절 임박";
  if (product.discountPercentage >= 15) return "MD도 놀란 특가";
  if (product.rating >= 4.7) return "왠지 인기 많음";
  if (product.id % 4 === 0) return "오늘출발";
  if (product.id % 3 === 0) return "무료배송";

  return "구경만 해도 됨";
}

export default function FakeShopPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(PRODUCT_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`상품 조회 실패: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error(error);
        setErrorMessage("상품들이 출근을 거부했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + getDiscountedPrice(item) * item.quantity,
        0
      ),
    [cart]
  );

  if (isLoading) {
    return (
      <main className="fake-shop-status">
        <h1>상품 진열 중…</h1>
        <p>존재하지 않는 물류센터에서 상품을 찾고 있습니다.</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="fake-shop-status">
        <h1>{errorMessage}</h1>
        <button type="button" onClick={() => window.location.reload()}>
          직원들 다시 부르기
        </button>
      </main>
    );
  }

  return (
    <main className="fake-shop">
      <header className="shop-header">
        <div>
          <p className="shop-eyebrow">현실 지출 0원 쇼핑몰</p>
          <h1>아무튼 마켓</h1>
        </div>

        <button type="button" className="cart-button">
          장바구니
          <span>{cartCount}</span>
        </button>
      </header>

      <section className="hero-banner">
        <p>오늘만 매일 진행</p>
        <h2>원하는 건 전부 담으세요.</h2>
        <span>통장 잔고는 안전하게 보호됩니다.</span>
      </section>

      <section className="coupon-row">
        <article className="coupon">
          <strong>5,000원</strong>
          <span>오늘도 살아낸 고객 전용</span>
        </article>

        <article className="coupon">
          <strong>13%</strong>
          <span>비 오는 날 문구류 쿠폰</span>
        </article>

        <article className="coupon">
          <strong>무료배송</strong>
          <span>사실 원래도 무료배송</span>
        </article>
      </section>

      <section className="product-section">
        <div className="section-heading">
          <div>
            <p>지금 괜히 인기</p>
            <h2>오늘의 특가 상품</h2>
          </div>

          <span>{products.length}개 진열됨</span>
        </div>

        <div className="product-grid">
          {products.map((product) => {
            const originalPrice = toFakeWon(product.price);
            const salePrice = getDiscountedPrice(product);

            return (
              <article className="product-card" key={product.id}>
                <div className="image-wrapper">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    loading="lazy"
                  />

                  <span className="product-badge">
                    {getProductBadge(product)}
                  </span>
                </div>

                <div className="product-info">
                  <span className="brand">
                    {product.brand ?? "이름 없는 명품"}
                  </span>

                  <h3>{product.title}</h3>

                  <p className="description">
                    {product.description}
                  </p>

                  <div className="rating">
                    ★ {product.rating.toFixed(1)}
                    <span> · 리뷰는 대체로 감동적</span>
                  </div>

                  <div className="price-row">
                    <strong>
                      {Math.round(product.discountPercentage)}%
                    </strong>

                    <div>
                      <del>{formatWon(originalPrice)}</del>
                      <p>{formatWon(salePrice)}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="add-button"
                    onClick={() => addToCart(product)}
                  >
                    죄책감 없이 담기
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {cartCount > 0 && (
        <aside className="cart-summary">
          <div>
            <strong>{cartCount}개나 담았습니다</strong>
            <p>괜찮아요. 실제 지출은 아직 0원입니다.</p>
          </div>

          <button type="button">
            {formatWon(cartTotal)} 결제하는 척하기
          </button>
        </aside>
      )}
    </main>
  );
}