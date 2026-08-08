import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Trans, useTranslation } from "react-i18next";
import styles from "./Detail.module.css";
import {
  findProduct,
  pexelsPhotoUrl,
  productImage,
  relatedProducts,
  sizeOptions,
} from "../../data/products";
import { loadProductReviews } from "../../data/reviews";
import { getCategoryPath } from "../../data/categories";
import { useCart } from "../../cart/CartProvider";
import { DEFAULT_OPTION, MAX_QTY } from "../../cart/cartStorage";
import { copyText } from "../../lib/clipboard";
import useGoBack from "../../hooks/useGoBack";
import useBottomBar from "../../hooks/useBottomBar";
import LanguageToggle from "../../components/LanguageToggle";
import usePrice from "../../lib/usePrice";

import {
  BiCart,
  BiChevronLeft,
  BiShareAlt,
} from "react-icons/bi";

const DETAIL_IMAGE_H = 900;

/* 리뷰가 많은 상품은 111개까지 있다. 처음엔 조금만 펼친다. */
const REVIEW_STEP = 5;

/* 4.7 → ★★★★★ */
function stars(rating) {
  const filled = Math.round(rating);
  return "★".repeat(filled) + "☆".repeat(Math.max(0, 5 - filled));
}

export default function Detail() {
  const { t, i18n } = useTranslation(["detail", "common"]);
  const lang = i18n.resolvedLanguage;
  const price = usePrice();
  const { productId } = useParams();
  const goBack = useGoBack();
  const navigate = useNavigate();
  const { addItem, count: cartCount } = useCart();

  /* 구매바 높이는 CSS(--bar-h)가 정하므로 페이지 요소는 넘기지 않는다.
     여기서는 토스트를 바 위로 띄우는 데만 쓴다. */
  const buybarRef = useBottomBar();

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

  /* 리뷰는 상세를 열고 나서 따로 받아 온다. 받기 전에는 null. */
  const [reviewData, setReviewData] = useState(null);
  const [shownReviews, setShownReviews] = useState(REVIEW_STEP);

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

  /* 스펙에 사이즈 항목이 있는 상품만 사이즈 칩을 만든다. (1446개 중 325개)
     스펙 항목 이름은 언어를 타므로 어느 이름을 찾을지는 products.js가 안다. */
  const sizes = useMemo(() => sizeOptions(product, lang), [product, lang]);

  const reviews = reviewData?.reviews ?? [];
  const reviewCount = reviewData?.reviewCount ?? 0;
  const rating = reviewData?.averageRating ?? 0;

  /* "몇 %가 만족" 문구도 분포에서 직접 센다. */
  const positiveRate = reviewCount
    ? Math.round(
        ((reviewData.ratingDistribution[4] + reviewData.ratingDistribution[5]) /
          reviewCount) *
          100
      )
    : 0;

  const TABS = useMemo(
    () => [
      { id: "info", label: t("tabs.info") },
      { id: "spec", label: t("tabs.spec") },
      /* 아직 못 받았으면 숫자 자리를 비워 둔다. */
      {
        id: "reviews",
        label: reviewData
          ? t("tabs.reviewsWithCount", { count: reviewCount })
          : t("tabs.reviews"),
      },
      { id: "related", label: t("tabs.related") },
    ],
    [t, reviewData, reviewCount]
  );

  /* 상품이 바뀌면 옵션 · 수량을 초기화한다. */
  useEffect(() => {
    setQty(1);
    setSizeIndex(0);
    setActiveTab("info");
    setSlideIndex(0);
    setShownReviews(REVIEW_STEP);
  }, [product?.id]);

  /* 상품을 빠르게 옮겨 다니면 응답 순서가 뒤집힐 수 있어 늦게 온 건 버린다. */
  useEffect(() => {
    if (!product?.id) return;

    let alive = true;
    setReviewData(null);

    loadProductReviews(product.id, lang)
      .then((data) => {
        if (alive) setReviewData(data);
      })
      .catch((error) => {
        console.error("리뷰를 불러오지 못했습니다.", error);
        if (alive) setReviewData(null);
      });

    return () => {
      alive = false;
    };
  }, [product?.id, lang]);

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
      copied ? t("shareResult.copied") : t("shareResult.blocked")
    );
  }

  /* 고른 옵션. 사이즈가 없는 상품은 "단일 옵션"이다. */
  function chosenOption() {
    return sizes.length > 0 ? sizes[sizeIndex] : DEFAULT_OPTION;
  }

  function addToCart() {
    addItem(product, { option: chosenOption(), qty });
    toast(t("addedToCart", { count: qty }));
  }

  /* 바로 구매는 장바구니를 거치지 않는다. 주문서에 이 한 줄만 들고 간다. */
  function buyNow() {
    navigate("/checkout", {
      state: {
        buyNow: { productId: product.id, option: chosenOption(), qty },
      },
    });
  }

  const today = new Intl.DateTimeFormat(t("common:intlLocale"), {
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
            aria-label={t("back")}
            onClick={goBack}
          >
            <BiChevronLeft size={22} aria-hidden="true" />
          </button>
          <div className={styles.title}>{t("notFound.headerTitle")}</div>

          <LanguageToggle />
        </header>

        <div className={styles.missing}>
          <strong>{t("notFound.title")}</strong>
          <p>{t("notFound.lead")}</p>
          <Link className={styles.missingLink} to="/">
            {t("notFound.link")}
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
          aria-label={t("backToList")}
          onClick={goBack}
        >
          <BiChevronLeft size={22} aria-hidden="true" />
        </button>

        <div className={styles.title}>{product.name}</div>

        <div className={styles.headerActions}>
          

          <button
            type="button"
            className={styles.iconBtn}
            aria-label={t("share")}
            onClick={share}
          >
            <BiShareAlt size={19} aria-hidden="true" />
          </button>

          <Link
            className={styles.iconBtn}
            to="/cart"
            aria-label={t("cartAria", { count: cartCount })}
          >
            <BiCart size={20} aria-hidden="true" />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          <div className={styles.toggleAdjust}>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className={styles.wrap}>
        <nav className={styles.crumbs} aria-label={t("crumbsAria")}>
          <Link to="/">{t("home")}</Link>

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
          <section className={styles.gallery} aria-label={t("galleryAria")}>
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
                <span className={styles.tag}>{t("tags.freeShipping")}</span>
                <span className={styles.tag}>{t("tags.todayShip")}</span>
              </div>

              <div className={styles.price}>
                {discount > 0 && (
                  <span className={styles.off}>{discount}%</span>
                )}
                <span className={styles.now}>{price(product.price)}</span>
                {product.listPrice && (
                  <span className={styles.was}>{price(product.listPrice)}</span>
                )}
              </div>

              <div className={styles.rating}>
                {!reviewData && <span className={styles.ratingWait}>—</span>}

                {reviewData && reviewCount === 0 && (
                  <span className={styles.ratingWait}>
                    {t("noReviewsShort")}
                  </span>
                )}

                {reviewCount > 0 && (
                  <>
                    <span className={styles.stars}>{stars(rating)}</span>
                    <span>{rating}</span>
                    <button
                      type="button"
                      className={styles.reviewLink}
                      onClick={() => scrollToSection("reviews")}
                    >
                      {t("reviewCountLink", { count: reviewCount })}
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* 굵게 들어가는 자리가 문장 안에 있어 Trans로 넘긴다.
                영어에서 어순이 바뀌어도 번역문만 고치면 된다. */}
            <dl className={styles.rows}>
              <div className={styles.row}>
                <dt>{t("rows.shipping")}</dt>
                <dd>
                  <Trans
                    ns="detail"
                    i18nKey="rows.shippingValue"
                    components={{ b: <b /> }}
                  />
                </dd>
              </div>
              <div className={styles.row}>
                <dt>{t("rows.eta")}</dt>
                <dd>
                  <Trans
                    ns="detail"
                    i18nKey="rows.etaValue"
                    values={{ date: today }}
                    components={{ b: <b /> }}
                  />
                </dd>
              </div>
              <div className={styles.row}>
                <dt>{t("rows.benefit")}</dt>
                <dd>
                  <Trans
                    ns="detail"
                    i18nKey="rows.benefitValue"
                    values={{ points: Math.round(product.price * 0.05) }}
                    components={{ b: <b /> }}
                  />
                </dd>
              </div>
            </dl>

            <section className={styles.options} aria-label={t("options.aria")}>
              {sizes.length > 0 && (
                <div className={styles.opt}>
                  <span className={styles.eyebrow}>{t("options.size")}</span>

                  <div
                    className={styles.chips}
                    role="group"
                    aria-label={t("options.size")}
                  >
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
                <span className={styles.eyebrow}>{t("options.qty")}</span>

                <div className={styles.qty}>
                  <button
                    type="button"
                    aria-label={t("options.qtyDown")}
                    disabled={qty <= 1}
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                  >
                    −
                  </button>

                  <output aria-live="polite">{qty}</output>

                  <button
                    type="button"
                    aria-label={t("options.qtyUp")}
                    disabled={qty >= MAX_QTY}
                    onClick={() => setQty((n) => Math.min(MAX_QTY, n + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={styles.total}>
                <span>{t("options.total")}</span>
                <strong>{price(total)}</strong>
              </div>
            </section>

            <div className={styles.buybar} ref={buybarRef}>

              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={addToCart}
              >
                {t("buy.cart")}
              </button>

              <button
                type="button"
                className={styles.btn}
                onClick={buyNow}
              >
                {t("buy.now")}
              </button>
            </div>
          </div>
        </div>

        <nav className={styles.tabs} ref={tabsRef} aria-label={t("tabsAria")}>
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
              {t("imageCredit")}{" "}
              <a href={pexelsUrl} target="_blank" rel="noreferrer">
                Pexels
              </a>
            </p>
          </section>

          <section className={styles.section} ref={setSectionRef("spec")}>
            <h2>{t("specTitle")}</h2>

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
              {t("reviews.title")} {reviewData && <small>{reviewCount}</small>}
            </h2>

            {!reviewData && (
              <p className={styles.revEmpty}>{t("reviews.loading")}</p>
            )}

            {reviewData && reviewCount === 0 && (
              <p className={styles.revEmpty}>
                {t("reviews.emptyLine1")}
                <br />
                {t("reviews.emptyLine2")}
              </p>
            )}

            {reviewCount > 0 && (
              <>
                <div className={styles.revSummary}>
                  <div className={styles.revHead}>
                    <span className={styles.revScore}>{rating}</span>

                    <div className={styles.revMeta}>
                      <span className={styles.stars}>{stars(rating)}</span>
                      <small>
                        {t("reviews.positiveRate", { rate: positiveRate })}
                      </small>
                    </div>
                  </div>

                  {/* 5점부터 위에서 아래로 */}
                  <ul className={styles.revBars}>
                    {[5, 4, 3, 2, 1].map((score) => {
                      const count = reviewData.ratingDistribution[score] ?? 0;

                      return (
                        <li key={score}>
                          <span>{t("reviews.score", { score })}</span>
                          <i>
                            <b
                              style={{
                                width: `${(count / reviewCount) * 100}%`,
                              }}
                            />
                          </i>
                          <small>{count}</small>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  {reviews.slice(0, shownReviews).map((review) => (
                    <article className={styles.review} key={review.id}>
                      <div className={styles.reviewTop}>
                        <span className={styles.stars}>
                          {stars(review.rating)}
                        </span>
                        <span>{review.writer}</span>
                        <span>{review.date}</span>
                      </div>
                      <p>{review.text}</p>
                    </article>
                  ))}
                </div>

                {shownReviews < reviewCount && (
                  <button
                    type="button"
                    className={styles.revMore}
                    onClick={() =>
                      setShownReviews((shown) => shown + REVIEW_STEP)
                    }
                  >
                    {t("reviews.more", { count: reviewCount - shownReviews })}
                  </button>
                )}
              </>
            )}
          </section>

          <section className={styles.section} ref={setSectionRef("related")}>
            <h2>{t("relatedTitle")}</h2>

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

                  <span className={styles.cardPrice}>{price(item.price)}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
