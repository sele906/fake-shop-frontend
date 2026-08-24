import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trans, useTranslation } from "react-i18next";
import styles from "./Cart.module.css";
import { getProducts, productImage } from "../../data/products";
import { useCart } from "../../cart/CartProvider";
import { DEFAULT_OPTION, MAX_QTY } from "../../cart/cartStorage";
import { couponDiscount } from "../../coupon/couponStorage";
import useSavedCoupons from "../../coupon/useSavedCoupons";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";
import { MISSION } from "../../coupon/hiddenStorage";
import useGoBack from "../../hooks/useGoBack";
import useBottomBar from "../../hooks/useBottomBar";
import AccountMenu from "../../components/AccountMenu";
import usePrice from "../../lib/usePrice";

import { BiChevronLeft, BiX } from "react-icons/bi";

const FREE_SHIP = 50000;
const SHIP_FEE = 3500;

/**
 * 숨은 쿠폰이 걸린 코드.
 *
 * 화면에 그리는 문구가 아니라 사용자가 입력하는 값이라 locales에 두지 않는다.
 * 언어를 가리지 않고 둘 다 받는다. 한쪽 언어로 알아낸 코드를 스크린샷으로
 * 공유했을 때, 다른 언어로 보던 사람이 입력해도 통해야 하기 때문이다.
 *
 * 영어 코드는 공백과 대소문자를 무시한다. 한글은 대소문자가 없어 그대로 비교한다.
 */
const HIDDEN_CODES = ["진짜안삼", "NOTBUYING"];

function normalizeCode(value) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function isHiddenCode(input) {
  const normalized = normalizeCode(input);

  return HIDDEN_CODES.some((code) => normalizeCode(code) === normalized);
}

export default function Cart() {
  const { t } = useTranslation(["cart", "common"]);
  const price = usePrice();
  const goBack = useGoBack();
  const navigate = useNavigate();

  const {
    items,
    removeItem,
    removeSelected,
    changeQty,
    toggleSelected,
    selectAll,
  } = useCart();

  const [coupon, setCoupon] = useState("");

  /* 박아둔 96px이 실제(약 119px)보다 모자라 목록 맨 아래 출처 문구가 바에
     가려져 있었다. 바 높이를 재서 --bar-h와 토스트 띄우기에 함께 쓴다. */
  const pageRef = useRef(null);
  const barRef = useBottomBar(pageRef);

  /* 쿠폰 보관함(/coupon)에서 받아 localStorage에 쌓아둔 쿠폰들. */
  const [ownedCoupons, , removeCoupons] = useSavedCoupons();
  const { unlock } = useHiddenCoupon();
  const [selectedCouponIds, setSelectedCouponIds] = useState([]);

  /* 쿠폰함에서 삭제된 쿠폰이 선택 상태로 남지 않게 한다. */
  useEffect(() => {
    const ownedIds = new Set(ownedCoupons.map((item) => item.id));

    setSelectedCouponIds((current) => {
      const next = current.filter((id) => ownedIds.has(id));

      return next.length === current.length ? current : next;
    });
  }, [ownedCoupons]);

  /* 품절은 상품의 속성이다. products.json에 재고 정보가 아직 없어서
     지금은 "구매 불가" 묶음이 늘 비어 있고, soldOut 필드가 생기면 살아난다. */
  const buyable = items.filter((item) => !item.product.soldOut);
  const soldOut = items.filter((item) => item.product.soldOut);
  const selected = buyable.filter((item) => item.selected);

  /* 정가 합계 · 실제 결제액 · 할인은 선택된 줄만 센다. */
  const listTotal = selected.reduce(
    (sum, { product, qty }) => sum + (product.listPrice ?? product.price) * qty,
    0
  );
  const itemTotal = selected.reduce(
    (sum, { product, qty }) => sum + product.price * qty,
    0
  );
  const discount = listTotal - itemTotal;
  const shipFee = itemTotal === 0 || itemTotal >= FREE_SHIP ? 0 : SHIP_FEE;

  const selectedCoupons = ownedCoupons.filter((item) =>
    selectedCouponIds.includes(item.id)
  );

  /* 쿠폰은 몇 장이든 중복되지만 깎을 수 있는 건 낼 돈까지다.
     0원이 바닥이고, 넘치는 만큼은 그냥 버려진다. */
  const payable = itemTotal + shipFee;
  const couponRaw = couponDiscount(selectedCoupons, itemTotal);
  const couponOff = Math.min(payable, couponRaw);
  const couponWasted = couponRaw - couponOff;

  const grandTotal = payable - couponOff;
  const points = Math.floor(itemTotal * 0.05);

  const shipLeft = Math.max(0, FREE_SHIP - itemTotal);
  const shipPercent = Math.min(100, Math.round((itemTotal / FREE_SHIP) * 100));

  const isAllSelected = buyable.length > 0 && selected.length === buyable.length;
  const isAllCouponsSelected =
    ownedCoupons.length > 0 && selectedCouponIds.length === ownedCoupons.length;

  /* 장바구니에 없는 상품만 추천한다. */
  const recommended = useMemo(() => {
    const inCart = new Set(items.map((item) => item.productId));

    return getProducts()
      .filter((product) => !inCart.has(product.id))
      .slice(0, 4);
  }, [items]);

  /* 사이즈가 없는 상품의 옵션은 저장소가 정한 고정값이라 그릴 때만 번역한다.
     사용자가 고른 사이즈("M" 같은 값)는 그대로 내보낸다. */
  function optionLabel(option) {
    return option === DEFAULT_OPTION ? t("common:defaultOption") : option;
  }

  function removeLine(key) {
    removeItem(key);
    toast(t("toast.removed"));
  }

  function toggleCoupon(couponId) {
    setSelectedCouponIds((current) =>
      current.includes(couponId)
        ? current.filter((id) => id !== couponId)
        : [...current, couponId]
    );
  }

  function toggleAllCoupons() {
    if (isAllCouponsSelected) {
      setSelectedCouponIds([]);
      return;
    }

    setSelectedCouponIds(ownedCoupons.map((item) => item.id));
    toast(t("toast.allCouponsApplied", { count: ownedCoupons.length }));
  }

  /* 코드로 받을 수 있는 쿠폰은 숨은 쿠폰 하나뿐이다. 나머지는 전부 반려된다. */
  function applyCouponCode(event) {
    event.preventDefault();

    const code = coupon.trim();

    if (!code) {
      toast(
        <>
          {t("toast.noCodeLine1")}
          <br />
          {t("toast.noCodeLine2")}
        </>
      );
      return;
    }

    /* 숨은 쿠폰. 처음 맞힌 한 번만 쿠폰이 오고, 그 뒤로는 아래로 떨어진다. */
    if (isHiddenCode(code) && unlock(MISSION.CART_CODE)) {
      setCoupon("");
      return;
    }

    toast(
      <>
        {t("toast.badCodeLine1")}
        <br />
        {t("toast.badCodeLine2")}
      </>
    );
  }

  /* 주문으로 넘어가면 고른 쿠폰은 쓴 것으로 보고 쿠폰함에서 없앤다.
     결제는 일어나지 않지만 쿠폰이 닳는 것만은 진짜다. */
  function goToCheckout() {
    if (selectedCouponIds.length) {
      removeCoupons(selectedCouponIds);
      toast(t("toast.couponsUsed", { count: selectedCouponIds.length }));
    }

    navigate("/checkout");
  }

  function handleRemoveSelected() {
    if (selected.length === 0) {
      toast(t("toast.noneSelected"));
      return;
    }

    toast(t("toast.removedSelected", { count: selected.length }));
    removeSelected();
  }

  return (
    <div className={styles.page} ref={pageRef}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={t("back")}
          onClick={goBack}
        >
          <BiChevronLeft aria-hidden="true" />
        </button>

        <h1>
          {t("title")} <em>{items.length}</em>
        </h1>

        <Link className={styles.home} to="/">
          {t("keepShopping")}
        </Link>

        <AccountMenu />
      </header>

      <div className={`${styles.wrap} ${styles.cols}`}>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <strong>{t("empty.title")}</strong>
            <p>{t("empty.lead")}</p>
            <Link className={styles.btn} to="/">
              {t("empty.cta")}
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.layout}>
              <section className={styles.ship} aria-label={t("ship.aria")}>
                <p>
                  {shipLeft > 0 ? (
                    <Trans
                      ns="cart"
                      i18nKey="ship.remaining"
                      values={{ amount: price(shipLeft) }}
                      components={{ b: <b /> }}
                    />
                  ) : (
                    <Trans
                      ns="cart"
                      i18nKey="ship.met"
                      components={{ b: <b /> }}
                    />
                  )}
                </p>

                <div
                  className={styles.meter}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={shipPercent}
                >
                  <i style={{ width: `${shipPercent}%` }} />
                </div>
              </section>

              <div className={styles.selbar}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(event) => selectAll(event.target.checked)}
                  />
                  <span>
                    {t("selbar.selectAll", {
                      selected: selected.length,
                      total: buyable.length,
                    })}
                  </span>
                </label>

                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={handleRemoveSelected}
                >
                  {t("selbar.removeSelected")}
                </button>
              </div>

              {buyable.length > 0 && (
                <section
                  className={styles.group}
                  aria-label={t("group.directAria")}
                >
                  <div className={styles.groupHead}>
                    {t("group.directHead")} <span>{t("group.directNote")}</span>
                  </div>

                  {buyable.map(({ key, product, option, qty, selected: isSelected }) => (
                    <article className={styles.item} key={key}>
                      <label className={styles.check}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          aria-label={t("item.selectAria", {
                            name: product.name,
                          })}
                          onChange={(event) =>
                            toggleSelected(key, event.target.checked)
                          }
                        />
                      </label>

                      <Link
                        className={styles.thumb}
                        to={`/product/${product.id}`}
                        aria-label={product.name}
                      >
                        <img
                          src={productImage(product.image)}
                          alt={product.image.alt || product.name}
                          loading="lazy"
                        />
                      </Link>

                      <div className={styles.info}>
                        <span className={styles.brand}>{product.brand}</span>

                        <Link
                          className={styles.name}
                          to={`/product/${product.id}`}
                        >
                          {product.name}
                        </Link>

                        <span className={styles.opt}>
                          {optionLabel(option)}
                        </span>

                        {/* 줄에 따로 저장하지 않고 상품이 달고 있는 태그를 쓴다. */}
                        {product.tag && (
                          <span className={styles.flag}>{product.tag}</span>
                        )}

                        <div className={styles.line}>
                          <div className={styles.qty}>
                            <button
                              type="button"
                              aria-label={t("item.qtyDown")}
                              disabled={qty <= 1}
                              onClick={() => changeQty(key, -1)}
                            >
                              −
                            </button>

                            <output aria-live="polite">{qty}</output>

                            <button
                              type="button"
                              aria-label={t("item.qtyUp")}
                              disabled={qty >= MAX_QTY}
                              onClick={() => changeQty(key, 1)}
                            >
                              +
                            </button>
                          </div>

                          <div className={styles.prices}>
                            {product.listPrice && (
                              <span className={styles.was}>
                                {price(product.listPrice * qty)}
                              </span>
                            )}
                            <span className={styles.now}>
                              {price(product.price * qty)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.remove}
                        aria-label={t("item.removeAria", {
                          name: product.name,
                        })}
                        onClick={() => removeLine(key)}
                      >
                        <BiX size={18} aria-hidden="true" />
                      </button>
                    </article>
                  ))}
                </section>
              )}

              {soldOut.length > 0 && (
                <section
                  className={styles.group}
                  aria-label={t("group.soldOutAria")}
                >
                  <div className={styles.groupHead}>
                    {t("group.soldOutHead")}{" "}
                    <span>{t("group.soldOutNote")}</span>
                  </div>

                  {soldOut.map(({ key, product }) => (
                    <article
                      className={`${styles.item} ${styles.out}`}
                      key={key}
                    >
                      <label className={styles.check}>
                        <input
                          type="checkbox"
                          disabled
                          aria-label={t("item.cannotSelect")}
                        />
                      </label>

                      <div className={styles.thumb}>
                        <img
                          src={productImage(product.image)}
                          alt={product.image.alt || product.name}
                          loading="lazy"
                        />
                      </div>

                      <div className={styles.info}>
                        <span className={styles.brand}>{product.brand}</span>

                        <Link
                          className={styles.name}
                          to={`/product/${product.id}`}
                        >
                          {product.name}
                        </Link>

                        <span className={`${styles.flag} ${styles.warn}`}>
                          {t("item.soldOut")}
                        </span>

                        <div className={styles.line}>
                          <div className={styles.prices}>
                            <span className={styles.now}>
                              {price(product.price)}
                            </span>
                          </div>

                          <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={() => toast(t("toast.restockRequested"))}
                          >
                            {t("item.restock")}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.remove}
                        aria-label={t("item.removeAria", {
                          name: product.name,
                        })}
                        onClick={() => removeLine(key)}
                      >
                        <BiX size={18} aria-hidden="true" />
                      </button>
                    </article>
                  ))}
                </section>
              )}
            </div>

            <div className={styles.side}>
              <div className={styles.couponBox}>
                <div className={styles.couponTitle}>
                  <strong>{t("coupon.title")}</strong>
                  <span>
                    {t("coupon.selectedCount", {
                      count: selectedCouponIds.length,
                    })}
                  </span>
                </div>

                {ownedCoupons.length === 0 ? (
                  <p className={styles.couponEmpty}>
                    <Trans
                      ns="cart"
                      i18nKey="coupon.empty"
                      components={{ walletLink: <Link to="/coupon" /> }}
                    />
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.selectAll}
                      onClick={toggleAllCoupons}
                    >
                      {isAllCouponsSelected
                        ? t("coupon.deselectAll")
                        : t("coupon.selectAll", {
                            count: ownedCoupons.length,
                          })}
                    </button>

                    <div className={styles.couponList}>
                      {ownedCoupons.map((item) => (
                        <label key={item.id} className={styles.couponItem}>
                          <input
                            type="checkbox"
                            checked={selectedCouponIds.includes(item.id)}
                            onChange={() => toggleCoupon(item.id)}
                          />

                          <span>{item.name}</span>
                          <strong>{item.benefit}</strong>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                <form
                  className={styles.couponCode}
                  aria-label={t("coupon.codeFormAria")}
                  onSubmit={applyCouponCode}
                >
                  <input
                    type="text"
                    placeholder={t("coupon.codePlaceholder")}
                    aria-label={t("coupon.codeAria")}
                    value={coupon}
                    onChange={(event) => setCoupon(event.target.value)}
                  />

                  <button type="submit">{t("coupon.apply")}</button>
                </form>
              </div>

              <section className={styles.sum} aria-label={t("sum.aria")}>
                <h2>{t("sum.title")}</h2>

                <div className={styles.sumRow}>
                  <span>{t("sum.itemTotal")}</span>
                  <span>{price(listTotal)}</span>
                </div>

                <div className={`${styles.sumRow} ${styles.disc}`}>
                  <span>{t("sum.itemDiscount")}</span>
                  <span>{discount ? `−${price(discount)}` : t("sum.zero")}</span>
                </div>

                <div className={`${styles.sumRow} ${styles.disc}`}>
                  <span>
                    {t("sum.couponDiscount", {
                      count: selectedCouponIds.length,
                    })}
                  </span>
                  <span>{couponOff ? `−${price(couponOff)}` : t("sum.zero")}</span>
                </div>

                <div className={styles.sumRow}>
                  <span>{t("sum.shipping")}</span>
                  <span>{shipFee ? price(shipFee) : t("sum.free")}</span>
                </div>

                <div className={`${styles.sumRow} ${styles.grand}`}>
                  <span>{t("sum.grandTotal")}</span>
                  <strong>{price(grandTotal)}</strong>
                </div>

                {couponWasted > 0 && (
                  <p className={styles.note}>
                    <Trans
                      ns="cart"
                      i18nKey="sum.wasted"
                      values={{ amount: price(couponWasted) }}
                      components={{ b: <b /> }}
                    />
                  </p>
                )}

                <p className={styles.note}>
                  <Trans
                    ns="cart"
                    i18nKey="sum.points"
                    values={{
                      points: points.toLocaleString(t("common:intlLocale")),
                    }}
                    components={{ b: <b /> }}
                  />
                </p>
              </section>

              <div className={styles.checkout} ref={barRef}>
                <div className={styles.checkoutRow}>
                  <span>
                    {t("checkout.selectedCount", { count: selected.length })}
                  </span>
                  <strong>{price(grandTotal)}</strong>
                </div>

                <button
                  type="button"
                  className={styles.btn}
                  disabled={selected.length === 0}
                  onClick={goToCheckout}
                >
                  {selected.length
                    ? t("checkout.order", { amount: price(grandTotal) })
                    : t("checkout.selectFirst")}
                </button>
              </div>
            </div>
          </>
        )}

        <section className={styles.rec} aria-label={t("rec.aria")}>
          <h2>{t("rec.title")}</h2>

          <div className={styles.recGrid}>
            {recommended.map((product) => (
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
                </Link>

                <span className={styles.cardBrand}>{product.brand}</span>

                <Link className={styles.cardName} to={`/product/${product.id}`}>
                  {product.name}
                </Link>

                <span className={styles.cardPrice}>{price(product.price)}</span>
              </article>
            ))}
          </div>
        </section>

        {/* 이 화면에도 사진이 실리므로 Pexels 출처를 남긴다. (공용 푸터 밖이다) */}
        <p className={styles.credit}>
          {t("imageCredit")}{" "}
          <a href="https://www.pexels.com" target="_blank" rel="noreferrer">
            Pexels
          </a>
        </p>
      </div>

    </div>
  );
}
