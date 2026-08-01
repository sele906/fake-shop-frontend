import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import styles from "./Cart.module.css";
import { PRODUCTS, productImage, won } from "../../data/products";
import { useCart } from "../../cart/CartProvider";
import { MAX_QTY } from "../../cart/cartStorage";
import { couponDiscount } from "../../coupon/couponStorage";
import useSavedCoupons from "../../coupon/useSavedCoupons";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";
import { MISSION } from "../../coupon/hiddenStorage";
import useGoBack from "../../hooks/useGoBack";

import { BiChevronLeft, BiX } from "react-icons/bi";

const FREE_SHIP = 50000;
const SHIP_FEE = 3500;

/* 숨은 쿠폰이 걸린 코드. 대소문자가 없는 한글이라 그대로 비교한다. */
const HIDDEN_CODE = "진짜안삼";

export default function Cart() {
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

    return PRODUCTS.filter((product) => !inCart.has(product.id)).slice(0, 4);
  }, [items]);

  function removeLine(key) {
    removeItem(key);
    toast("상품을 삭제했습니다");
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
    toast(`${ownedCoupons.length}장을 전부 적용했습니다. 아무도 막지 않습니다.`);
  }

  /* 코드로 받을 수 있는 쿠폰은 숨은 쿠폰 하나뿐이다. 나머지는 전부 반려된다. */
  function applyCouponCode(event) {
    event.preventDefault();

    const code = coupon.trim();

    if (!code) {
      toast(
        <>
          사용 가능한 쿠폰 코드가 없습니다.
          <br />
          예상하셨겠지만요.
        </>
      );
      return;
    }

    /* 숨은 쿠폰. 처음 맞힌 한 번만 쿠폰이 오고, 그 뒤로는 아래로 떨어진다. */
    if (code === HIDDEN_CODE && unlock(MISSION.CART_CODE)) {
      setCoupon("");
      return;
    }

    toast(
      <>
        존재하지 않는 쿠폰입니다.
        <br />
        하지만 입력하는 모습은 제법 그럴듯했습니다.
      </>
    );
  }

  /* 주문으로 넘어가면 고른 쿠폰은 쓴 것으로 보고 쿠폰함에서 없앤다.
     결제는 일어나지 않지만 쿠폰이 닳는 것만은 진짜다. */
  function goToCheckout() {
    if (selectedCouponIds.length) {
      removeCoupons(selectedCouponIds);
      toast(`쿠폰 ${selectedCouponIds.length}장을 사용했습니다. 쿠폰함에서 사라집니다.`);
    }

    navigate("/checkout");
  }

  function handleRemoveSelected() {
    if (selected.length === 0) {
      toast("선택된 상품이 없습니다");
      return;
    }

    toast(`${selected.length}개 상품을 삭제했습니다`);
    removeSelected();
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="뒤로"
          onClick={goBack}
        >
          <BiChevronLeft size={22} aria-hidden="true" />
        </button>

        <h1>
          장바구니 <em>{items.length}</em>
        </h1>

        <Link className={styles.home} to="/">
          계속 쇼핑
        </Link>
      </header>

      <div className={`${styles.wrap} ${styles.cols}`}>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <strong>장바구니가 비어 있어요</strong>
            <p>담아둔 상품이 없습니다. 이주의 특가부터 둘러보세요.</p>
            <Link className={styles.btn} to="/">
              쇼핑 계속하기
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.layout}>
              <section className={styles.ship} aria-label="무료배송 안내">
                <p>
                  {shipLeft > 0 ? (
                    <>
                      <b>{won(shipLeft)}</b> 더 담으면 <b>배송비 무료</b>까지
                      도착해요
                    </>
                  ) : (
                    <>
                      <b>배송비 무료</b> 조건을 채웠어요
                    </>
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
                    전체선택 ({selected.length}/{buyable.length})
                  </span>
                </label>

                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={handleRemoveSelected}
                >
                  선택 삭제
                </button>
              </div>

              {buyable.length > 0 && (
                <section className={styles.group} aria-label="안삼 직배송">
                  <div className={styles.groupHead}>
                    안삼 직배송 <span>· 무료배송</span>
                  </div>

                  {buyable.map(({ key, product, option, qty, selected: isSelected }) => (
                    <article className={styles.item} key={key}>
                      <label className={styles.check}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          aria-label={`${product.name} 선택`}
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

                        <span className={styles.opt}>{option}</span>

                        {/* 줄에 따로 저장하지 않고 상품이 달고 있는 태그를 쓴다. */}
                        {product.tag && (
                          <span className={styles.flag}>{product.tag}</span>
                        )}

                        <div className={styles.line}>
                          <div className={styles.qty}>
                            <button
                              type="button"
                              aria-label="수량 줄이기"
                              disabled={qty <= 1}
                              onClick={() => changeQty(key, -1)}
                            >
                              −
                            </button>

                            <output aria-live="polite">{qty}</output>

                            <button
                              type="button"
                              aria-label="수량 늘리기"
                              disabled={qty >= MAX_QTY}
                              onClick={() => changeQty(key, 1)}
                            >
                              +
                            </button>
                          </div>

                          <div className={styles.prices}>
                            {product.listPrice && (
                              <span className={styles.was}>
                                {won(product.listPrice * qty)}
                              </span>
                            )}
                            <span className={styles.now}>
                              {won(product.price * qty)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.remove}
                        aria-label={`${product.name} 삭제`}
                        onClick={() => removeLine(key)}
                      >
                        <BiX size={18} aria-hidden="true" />
                      </button>
                    </article>
                  ))}
                </section>
              )}

              {soldOut.length > 0 && (
                <section className={styles.group} aria-label="구매 불가 상품">
                  <div className={styles.groupHead}>
                    구매 불가 <span>· 재입고 알림 신청 가능</span>
                  </div>

                  {soldOut.map(({ key, product }) => (
                    <article
                      className={`${styles.item} ${styles.out}`}
                      key={key}
                    >
                      <label className={styles.check}>
                        <input type="checkbox" disabled aria-label="선택 불가" />
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
                          품절
                        </span>

                        <div className={styles.line}>
                          <div className={styles.prices}>
                            <span className={styles.now}>
                              {won(product.price)}
                            </span>
                          </div>

                          <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={() =>
                              toast("재입고 알림을 신청한 척했습니다")
                            }
                          >
                            재입고 알림
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.remove}
                        aria-label={`${product.name} 삭제`}
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
                  <strong>쿠폰 할인</strong>
                  <span>{selectedCouponIds.length}장 선택됨</span>
                </div>

                {ownedCoupons.length === 0 ? (
                  <p className={styles.couponEmpty}>
                    보유한 쿠폰이 없습니다.{" "}
                    <Link to="/coupon">쿠폰 보관함</Link>에서 받아오세요. 몇
                    장이든 중복됩니다.
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.selectAll}
                      onClick={toggleAllCoupons}
                    >
                      {isAllCouponsSelected
                        ? "전체 해제"
                        : `${ownedCoupons.length}장 전부 선택`}
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
                  aria-label="쿠폰 코드 적용"
                  onSubmit={applyCouponCode}
                >
                  <input
                    type="text"
                    placeholder="수상한 쿠폰 코드 입력"
                    aria-label="쿠폰 코드"
                    value={coupon}
                    onChange={(event) => setCoupon(event.target.value)}
                  />

                  <button type="submit">적용</button>
                </form>
              </div>

              <section className={styles.sum} aria-label="결제 금액">
                <h2>결제 금액</h2>

                <div className={styles.sumRow}>
                  <span>상품금액</span>
                  <span>{won(listTotal)}</span>
                </div>

                <div className={`${styles.sumRow} ${styles.disc}`}>
                  <span>상품할인</span>
                  <span>{discount ? `−${won(discount)}` : "0원"}</span>
                </div>

                <div className={`${styles.sumRow} ${styles.disc}`}>
                  <span>쿠폰할인 {selectedCouponIds.length}장</span>
                  <span>{couponOff ? `−${won(couponOff)}` : "0원"}</span>
                </div>

                <div className={styles.sumRow}>
                  <span>배송비</span>
                  <span>{shipFee ? won(shipFee) : "무료"}</span>
                </div>

                <div className={`${styles.sumRow} ${styles.grand}`}>
                  <span>총 결제금액</span>
                  <strong>{won(grandTotal)}</strong>
                </div>

                {couponWasted > 0 && (
                  <p className={styles.note}>
                    쿠폰이 <b>{won(couponWasted)}</b>어치 남았지만 0원이
                    바닥입니다. 나머지는 그냥 흘러넘칩니다.
                  </p>
                )}

                <p className={styles.note}>
                  멤버십 적립 예정 <b>{points.toLocaleString("ko-KR")}P</b> · 결제하는 기분만 안전하게 즐겨보세요.
                </p>
              </section>

              <div className={styles.checkout}>
                <div className={styles.checkoutRow}>
                  <span>선택 {selected.length}개</span>
                  <strong>{won(grandTotal)}</strong>
                </div>

                <button
                  type="button"
                  className={styles.btn}
                  disabled={selected.length === 0}
                  onClick={goToCheckout}
                >
                  {selected.length
                    ? `${won(grandTotal)} 주문하기`
                    : "상품을 선택해 주세요"}
                </button>
              </div>
            </div>
          </>
        )}

        <section className={styles.rec} aria-label="함께 담은 상품">
          <h2>같이 담으면 좋은 것</h2>

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

                <span className={styles.cardPrice}>{won(product.price)}</span>
              </article>
            ))}
          </div>
        </section>

        {/* 이 화면에도 사진이 실리므로 Pexels 출처를 남긴다. (공용 푸터 밖이다) */}
        <p className={styles.credit}>
          상품 이미지 출처:{" "}
          <a href="https://www.pexels.com" target="_blank" rel="noreferrer">
            Pexels
          </a>
        </p>
      </div>

    </div>
  );
}
