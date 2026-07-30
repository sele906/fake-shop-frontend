import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import styles from "./Detail.module.css";
import {
  findProduct,
  pexelsPhotoUrl,
  productImage,
  relatedProducts,
  won,
} from "../../data/products";
import { getCategoryPath } from "../../data/categories";
import { useCart } from "../../cart/CartProvider";
import { DEFAULT_OPTION, MAX_QTY } from "../../cart/cartStorage";
import { copyText } from "../../lib/clipboard";
import useGoBack from "../../hooks/useGoBack";

import {
  BiCart,
  BiChevronLeft,
  BiShareAlt,
} from "react-icons/bi";

/* 리뷰 데이터는 아직 없다. 화면 모양만 유지하려고 고정 리뷰를 그대로 쓴다. */
const REVIEWS = [
  {
    id: 1,
    rating: 5,
    writer: "김*연",
    option: "퀸 · 오트",
    date: "7월 21일",
    text: "세탁하고 나니 훨씬 부드러워졌어요. 오트 색이 사진보다 조금 더 따뜻한 톤입니다.",
  },
  {
    id: 2,
    rating: 4,
    writer: "이*훈",
    option: "싱글 · 차콜",
    date: "7월 18일",
    text: "여름에 덮고 자기 딱 좋은 두께. 다만 주름은 어느 정도 감안해야 합니다.",
  },
  {
    id: 3,
    rating: 5,
    writer: "박*아",
    option: "퀸 · 애쉬 블루",
    date: "7월 12일",
    text: "세 번째 구매예요. 색이 빠지지 않고 오래 갑니다.",
  },
];

/* 별점 · 리뷰 수도 상품 데이터에 없어서 위 고정 리뷰에서 만든다. */
const REVIEW_COUNT = REVIEWS.length;
const RATING =
  Math.round(
    (REVIEWS.reduce((sum, review) => sum + review.rating, 0) / REVIEW_COUNT) * 10
  ) / 10;

const DETAIL_IMAGE_H = 900;

/* 4.7 → ★★★★★ */
function stars(rating) {
  const filled = Math.round(rating);
  return "★".repeat(filled) + "☆".repeat(Math.max(0, 5 - filled));
}

export default function Detail() {
  const { productId } = useParams();
  const goBack = useGoBack();
  const navigate = useNavigate();
  const { addItem, count: cartCount } = useCart();

  /* 상품 id는 "0110-31871752"(카테고리코드-pexelsId) 형태의 문자열이다.
     URL 파라미터도 문자열이라 변환 없이 그대로 찾는다. */
  const id = productId;
  const product = findProduct(id);
  const related = useMemo(() => relatedProducts(id), [id]);

  const [qty, setQty] = useState(1);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const tabsRef = useRef(null);
  const headerRef = useRef(null);
  const sectionRefs = useRef({});

  /* 콜백 ref는 값을 반환하면 정리 함수로 취급되므로 대입만 한다.
     리렌더마다 ref가 떨어졌다 붙지 않도록 id별로 한 번만 만든다. */
  const setSectionRef = useMemo(() => {
    const cache = {};

    return (id) => {
      if (!cache[id]) {
        cache[id] = (element) => {
          sectionRefs.current[id] = element;
        };
      }

      return cache[id];
    };
  }, []);

  /* 상품마다 이미지는 한 장이다. 여러 장이 생기면 점 표시가 다시 살아난다. */
  const slides = useMemo(
    () => (product?.image ? [product.image] : []),
    [product]
  );

  /* 스펙에 "사이즈" 항목이 있는 상품만 사이즈 칩을 만든다. (1630개 중 415개) */
  const sizes = useMemo(() => {
    const row = product?.detail?.spec?.find((item) => item.label === "사이즈");
    if (!row) return [];

    return row.value
      .split("/")
      .map((size) => size.trim())
      .filter(Boolean);
  }, [product]);

  const TABS = useMemo(
    () => [
      { id: "info", label: "상품정보" },
      { id: "spec", label: "상세스펙" },
      { id: "reviews", label: `리뷰 ${REVIEW_COUNT}` },
      { id: "related", label: "함께 보기" },
    ],
    []
  );

  /* 상품이 바뀌면 옵션 · 수량을 초기화한다. */
  useEffect(() => {
    setQty(1);
    setSizeIndex(0);
    setActiveTab("info");
    setSlideIndex(0);
  }, [product?.id]);

  /* 스크롤: 헤더 상품명 노출 + 탭 하이라이트 */
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 160);

      const line = window.scrollY + 140;
      let current = TABS[0].id;

      TABS.forEach((tab) => {
        const section = sectionRefs.current[tab.id];
        if (section && section.offsetTop <= line) current = tab.id;
      });

      setActiveTab(current);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [TABS]);

  /* 모바일 갤러리: 가로 스와이프 위치를 점으로 표시한다. */
  function handleTrackScroll(event) {
    const track = event.currentTarget;
    if (!track.clientWidth) return;

    setSlideIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  function scrollToSection(id) {
    const section = sectionRefs.current[id];
    if (!section) return;

    const offset =
      (headerRef.current?.offsetHeight ?? 0) +
      (tabsRef.current?.offsetHeight ?? 0);

    window.scrollTo({
      top: section.getBoundingClientRect().top + window.scrollY - offset,
      behavior: "smooth",
    });
  }

  /* 모바일 브라우저에는 시스템 공유 시트가 있다. 없으면 주소를 복사한다. */
  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
        return;
      } catch (error) {
        /* 공유 시트를 그냥 닫은 것이므로 복사까지 하지는 않는다. */
        if (error.name === "AbortError") return;

        console.error("공유에 실패했습니다.", error);
      }
    }

    const copied = await copyText(url);

    toast(
      copied
        ? "주소를 복사했습니다"
        : "복사가 막혀 있습니다. 주소창에서 직접 복사해 주세요"
    );
  }

  /* 고른 옵션. 사이즈가 없는 상품은 "단일 옵션"이다. */
  function chosenOption() {
    return sizes.length > 0 ? sizes[sizeIndex] : DEFAULT_OPTION;
  }

  function addToCart() {
    addItem(product, { option: chosenOption(), qty });
    toast(`장바구니에 ${qty}개 담았습니다`);
  }

  /* 바로 구매는 장바구니를 거치지 않는다. 주문서에 이 한 줄만 들고 간다. */
  function buyNow() {
    navigate("/checkout", {
      state: {
        buyNow: { productId: product.id, option: chosenOption(), qty },
      },
    });
  }

  const today = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  /* 훅을 모두 선언한 뒤에 분기해야 렌더마다 훅 순서가 같다. */
  if (!product) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.back}`}
            aria-label="뒤로"
            onClick={goBack}
          >
            <BiChevronLeft size={22} aria-hidden="true" />
          </button>
          <div className={styles.title}>상품을 찾을 수 없습니다</div>
        </header>

        <div className={styles.missing}>
          <strong>사라진 상품입니다</strong>
          <p>주소가 잘못됐거나, 판매가 끝난 상품이에요.</p>
          <Link className={styles.missingLink} to="/">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const total = product.price * qty;
  const discount = product.listPrice
    ? Math.round((1 - product.price / product.listPrice) * 100)
    : 0;

  const path = getCategoryPath(product.categoryCode);
  const [topCategory, subCategory] = path;
  const pexelsUrl = pexelsPhotoUrl(product.image.pexelsId);

  return (
    <div className={styles.page}>
      <header
        ref={headerRef}
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.back}`}
          aria-label="목록으로"
          onClick={goBack}
        >
          <BiChevronLeft size={22} aria-hidden="true" />
        </button>

        <div className={styles.title}>{product.name}</div>

        <button
          type="button"
          className={styles.iconBtn}
          aria-label="공유"
          onClick={share}
        >
          <BiShareAlt size={19} aria-hidden="true" />
        </button>

        <Link
          className={styles.iconBtn}
          to="/cart"
          aria-label={`장바구니 ${cartCount}개`}
        >
          <BiCart size={20} aria-hidden="true" />
          {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </Link>
      </header>

      <div className={styles.wrap}>
        <nav className={styles.crumbs} aria-label="경로">
          <Link to="/">홈</Link>

          {topCategory && (
            <>
              <span aria-hidden="true">/</span>
              <Link to={`/category/${topCategory.code}`}>
                {topCategory.name}
              </Link>
            </>
          )}

          {subCategory && (
            <>
              <span aria-hidden="true">/</span>
              <Link to={`/category/${subCategory.code}`}>
                {subCategory.name}
              </Link>
            </>
          )}
        </nav>

        <div className={styles.top}>
          <section className={styles.gallery} aria-label="상품 이미지">
            <div
              className={`${styles.track} ${
                slides.length === 1 ? styles.single : ""
              }`}
              onScroll={handleTrackScroll}
            >
              {slides.map((image) => (
                <div key={image.pexelsId} className={styles.slide}>
                  <img
                    src={productImage(image, DETAIL_IMAGE_H)}
                    alt={image.alt || product.name}
                  />
                </div>
              ))}
            </div>

            {slides.length > 1 && (
              <div className={styles.dots} aria-hidden="true">
                {slides.map((image, index) => (
                  <i
                    key={image.pexelsId}
                    className={index === slideIndex ? styles.on : undefined}
                  />
                ))}
              </div>
            )}
          </section>

          <div className={styles.buy}>
            <section className={styles.summary}>
              <span className={styles.brand}>{product.brand}</span>

              <h1>{product.name}</h1>

              <p className={styles.lead}>{product.description}</p>

              <div className={styles.tags}>
                {product.tag && (
                  <span className={`${styles.tag} ${styles.solid}`}>
                    {product.tag}
                  </span>
                )}
                <span className={styles.tag}>무료배송</span>
                <span className={styles.tag}>오늘출발</span>
              </div>

              <div className={styles.price}>
                {discount > 0 && (
                  <span className={styles.off}>{discount}%</span>
                )}
                <span className={styles.now}>{won(product.price)}</span>
                {product.listPrice && (
                  <span className={styles.was}>{won(product.listPrice)}</span>
                )}
              </div>

              <div className={styles.rating}>
                <span className={styles.stars}>{stars(RATING)}</span>
                <span>{RATING}</span>
                <button
                  type="button"
                  className={styles.reviewLink}
                  onClick={() => scrollToSection("reviews")}
                >
                  리뷰 {REVIEW_COUNT}개
                </button>
              </div>
            </section>

            <dl className={styles.rows}>
              <div className={styles.row}>
                <dt>배송</dt>
                <dd>
                  <b>무료</b> · 평일 14시 이전 주문 시 당일 출고(하는 척)
                </dd>
              </div>
              <div className={styles.row}>
                <dt>도착 예정</dt>
                <dd>
                  <b>{today}</b> 도착 예정 없음
                </dd>
              </div>
              <div className={styles.row}>
                <dt>혜택</dt>
                <dd>
                  안삼 멤버십 <b>{Math.round(product.price * 0.05)}P</b> 적립 (5%)
                </dd>
              </div>
            </dl>

            <section className={styles.options} aria-label="옵션 선택">
              {sizes.length > 0 && (
                <div className={styles.opt}>
                  <span className={styles.eyebrow}>사이즈</span>

                  <div className={styles.chips} role="group" aria-label="사이즈">
                    {sizes.map((size, index) => (
                      <button
                        key={size}
                        type="button"
                        className={styles.chip}
                        aria-pressed={index === sizeIndex}
                        onClick={() => setSizeIndex(index)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.opt}>
                <span className={styles.eyebrow}>수량</span>

                <div className={styles.qty}>
                  <button
                    type="button"
                    aria-label="수량 줄이기"
                    disabled={qty <= 1}
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                  >
                    −
                  </button>

                  <output aria-live="polite">{qty}</output>

                  <button
                    type="button"
                    aria-label="수량 늘리기"
                    disabled={qty >= MAX_QTY}
                    onClick={() => setQty((n) => Math.min(MAX_QTY, n + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={styles.total}>
                <span>총 결제금액</span>
                <strong>{won(total)}</strong>
              </div>
            </section>

            <div className={styles.buybar}>

              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={addToCart}
              >
                장바구니
              </button>

              <button
                type="button"
                className={styles.btn}
                onClick={buyNow}
              >
                바로 구매
              </button>
            </div>
          </div>
        </div>

        <nav className={styles.tabs} ref={tabsRef} aria-label="상세 정보">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={activeTab === tab.id || undefined}
              onClick={() => scrollToSection(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.lower}>
          <section className={styles.section} ref={setSectionRef("info")}>
            <h2>{product.detail.title}</h2>

            {product.detail.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            <div className={styles.detailImg}>
              <img
                src={productImage(product.image, DETAIL_IMAGE_H)}
                alt={product.image.alt || product.name}
                loading="lazy"
              />
            </div>

            {/* Pexels 방침: 사진을 쓴 화면에 출처를 남긴다. */}
            <p className={styles.credit}>
              이미지 출처:{" "}
              <a href={pexelsUrl} target="_blank" rel="noreferrer">
                Pexels
              </a>
            </p>
          </section>

          <section className={styles.section} ref={setSectionRef("spec")}>
            <h2>상세스펙</h2>

            <table className={styles.spec}>
              <tbody>
                {product.detail.spec.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={styles.section} ref={setSectionRef("reviews")}>
            <h2>
              리뷰 <small>{REVIEW_COUNT}</small>
            </h2>

            <div className={styles.revSummary}>
              <span className={styles.revScore}>{RATING}</span>

              <div className={styles.revMeta}>
                <span className={styles.stars}>{stars(RATING)}</span>
                <small>96%가 재구매 의사를 남겼습니다</small>
              </div>
            </div>

            <div>
              {REVIEWS.map((review) => (
                <article className={styles.review} key={review.id}>
                  <div className={styles.reviewTop}>
                    <span className={styles.stars}>{stars(review.rating)}</span>
                    <span>{review.writer}</span>
                    <span>{review.option}</span>
                    <span>{review.date}</span>
                  </div>
                  <p>{review.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section} ref={setSectionRef("related")}>
            <h2>함께 보는 상품</h2>

            <div className={styles.rel}>
              {related.map((item) => (
                <article className={styles.card} key={item.id}>
                  <Link
                    className={styles.cardImg}
                    to={`/product/${item.id}`}
                    aria-label={item.name}
                  >
                    <img
                      src={productImage(item.image)}
                      alt={item.image.alt || item.name}
                      loading="lazy"
                    />
                  </Link>

                  <span className={styles.cardBrand}>{item.brand}</span>

                  <Link className={styles.cardName} to={`/product/${item.id}`}>
                    {item.name}
                  </Link>

                  <span className={styles.cardPrice}>{won(item.price)}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
