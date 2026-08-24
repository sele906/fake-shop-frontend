import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trans, useTranslation } from "react-i18next";
import styles from "./Checkout.module.css";
import { findProduct, productImage } from "../../data/products";
import { useCart } from "../../cart/CartProvider";
import { copyText } from "../../lib/clipboard";
import { makeOrderNumber, writeOrder } from "../../order/orderStorage";
import ReceiptCard from "../../receipt/ReceiptCard";
import { receiptUrl } from "../../receipt/receiptLink";
import useGoBack from "../../hooks/useGoBack";
import useBottomBar from "../../hooks/useBottomBar";
import AccountMenu from "../../components/AccountMenu";
import usePrice from "../../lib/usePrice";

import { BiChevronLeft } from "react-icons/bi";

/* 문구는 checkout.json이 들고, 코드에는 순서와 조건만 남긴다. */
const PAY_IDS = ["eye", "imagine", "patience", "screenshot"];
const RECOMMENDED_PAY_ID = "eye";

const DELIVERY_IDS = ["room", "balance", "urge", "door", "dream"];
const STAT_IDS = ["spent", "shipping", "coupon", "regret"];

/* 절제 · 도파민 문구가 갈리는 지점. checkout.json의 restraint · dopamine 키와 같다. */
const MESSAGE_STEPS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100,
];

/* 영수증 등급이 갈리는 지점. checkout.json의 receiptMsg 키와 같다. */
const RECEIPT_STEPS = [0, 20, 40, 60, 80, 100];

/**
 * 색종이.
 *
 * 파랑만 쓰면 브랜드에는 맞지만 축하로는 안 읽힌다. 쿠폰 카드가 이미 쓰는
 * 앰버 · 민트에 코럴 · 바이올렛을 더해 일곱 색으로 돌린다.
 *
 * 전에 있던 `#1c1e24`(거의 검정)와 `#dce3f8`(거의 흰색)은 뺐다. 배경이 한쪽
 * 모드에서 같은 색이 되어 조각이 통째로 사라진다 — 검정은 다크에서, 옅은
 * 파랑은 라이트에서. 남긴 일곱은 전부 중간 톤이라 두 모드에서 다 보인다.
 */
const CONFETTI_COLORS = [
  "#4b70d3",
  "#7290e8",
  "#f4b942",
  "#ef6461",
  "#3ec9a7",
  "#b06ef2",
  "#ffd166",
];

/* 사각형만 쓰면 비처럼 보인다. 사각형을 두 번 넣어 기본으로 두고,
   동그라미와 긴 리본을 섞는다. 리본은 더 느리게 떨어진다. */
const CONFETTI_SHAPES = ["cRect", "cRect", "cRound", "cRibbon"];

const CONFETTI_COUNT = 200;

/* 가장 늦은 조각(지연 1.4s + 낙하 4.2s)이 화면을 다 지나간 뒤에 지운다. */
const CONFETTI_MS = 5800;

const SHARE_RESET_MS = 2400;

/* 비율이 넘어선 지점 중 가장 큰 것. 넘어선 게 없으면 첫 지점을 쓴다. */
function lastPassed(steps, percent) {
  const passed = steps.filter((step) => percent >= step);

  return passed.length > 0 ? passed[passed.length - 1] : steps[0];
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * 조각마다 값을 흩어서 CSS 변수로 넘긴다. 실제 움직임은 CSS가 만든다.
 *
 * 두 덩어리로 나눈다. 앞의 3분의 2는 거의 동시에 터지고 나머지가 뒤따라
 * 흩날린다. 지연을 고르게 뿌리면 "터지는 순간"이 없어져서, 조각을 아무리
 * 늘려도 그냥 비가 오래 내리는 것이 된다.
 */
function makeConfetti() {
  return Array.from({ length: CONFETTI_COUNT }, (_, index) => {
    const shape =
      CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)];
    const ribbon = shape === "cRibbon";
    const burst = index < CONFETTI_COUNT * 0.82;

    return {
      id: index,
      shape,
      style: {
        /* 가장자리 밖에서 들어오는 것도 있어야 화면이 꽉 찬 느낌이 난다.
           .confetti가 overflow: hidden이라 잘려도 문제없다. */
        left: `${rand(-5, 105)}%`,
        "--c": CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        "--w": `${ribbon ? rand(5, 8) : rand(8, 14)}px`,
        "--h": `${ribbon ? rand(24, 40) : rand(11, 18)}px`,
        /* 좌우로 흔들리는 폭. 부호가 갈려서 서로 다른 쪽으로 쏠린다. */
        "--drift": `${rand(-140, 140)}px`,
        "--fall": `${ribbon ? rand(3.2, 4.2) : rand(2.1, 3.4)}s`,
        "--fall-delay": `${burst ? rand(0, 0.12) : rand(0.15, 0.85)}s`,
        /* 뒤집히는 주기. 짧을수록 팔랑거린다. */
        "--flutter": `${rand(0.3, 0.9)}s`,
      },
    };
  });
}

export default function Checkout() {
  const { t } = useTranslation(["checkout", "common"]);
  const price = usePrice();
  const goBack = useGoBack("/cart");
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, clear } = useCart();

  const [payIndex, setPayIndex] = useState(0);
  /* 절제 포인트는 0%에서 시작해서 사용자가 직접 올린다. */
  const [restraint, setRestraint] = useState(0);
  const [agreeService, setAgreeService] = useState(true);
  const [agreeThrill, setAgreeThrill] = useState(true);
  const [agreeNudge, setAgreeNudge] = useState(false);
  const [isWobbling, setIsWobbling] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [confetti, setConfetti] = useState([]);

  /* 문구가 아니라 상태만 들고 있는다. 문구를 상태에 넣어 두면
     언어를 바꿨을 때 옛 언어의 문장이 그대로 남는다. */
  const [isAnywayPressed, setIsAnywayPressed] = useState(false);
  const [shareState, setShareState] = useState("idle");

  const confettiTimer = useRef(null);
  const shareTimer = useRef(null);

  const [deliveryIndex, setDeliveryIndex] = useState(0);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  const modalRef = useRef(null);

  /**
   * 모바일 하단 고정 바가 본문 끝과 토스트를 가리지 않게, 바를 재서 쓴다.
   *
   * 바 안에는 요약줄 · 결제 버튼 · "그래도 사고 싶어요" · 안내문이 세로로 쌓이는데,
   * 이 높이는 문구 길이에 따라 달라진다. 언어를 바꾸면 새로고침 없이 그 자리에서
   * 버튼 글자가 한 줄 늘기도 해서, 숫자로 박아 두면 그때마다 아래가 잘린다.
   * (실제로 --bar-h가 104px로 고정돼 있어 한국어에서도 90px 넘게 잘리고 있었다.)
   *
   * 데스크톱은 바가 흐름 안에 있어 --bar-h가 필요 없고, CSS 쪽에서
   * padding-bottom을 0으로 덮는다.
   */
  const pageRef = useRef(null);
  const barRef = useBottomBar(pageRef);

  const deliveryId = DELIVERY_IDS[deliveryIndex];

  /* 상세에서 "바로 구매"로 들어오면 장바구니를 거치지 않은 주문 초안이 실려 온다. */
  const buyNow = location.state?.buyNow ?? null;

  /**
   * 주문서에 올릴 줄.
   *
   * 바로 구매면 그 한 줄만, 아니면 장바구니에서 체크한 줄들이다.
   * 두 경우 모두 { key, product, option, qty } 모양이라 아래가 갈리지 않는다.
   */
  const items = useMemo(() => {
    if (buyNow) {
      const product = findProduct(buyNow.productId);
      if (!product) return [];

      return [
        {
          key: `${buyNow.productId}::${buyNow.option}`,
          product,
          option: buyNow.option,
          qty: buyNow.qty,
          selected: true,
        },
      ];
    }

    return cartItems.filter((item) => item.selected);
  }, [buyNow, cartItems]);

  const total = items.reduce(
    (sum, { product, qty }) => sum + product.price * qty,
    0
  );

  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date());

  useEffect(
    () => () => {
      clearTimeout(confettiTimer.current);
      clearTimeout(shareTimer.current);
    },
    []
  );

  /* 배송지 모달이 열려 있는 동안: 배경 스크롤 잠금 · ESC로 닫기 · 포커스 가두기.
     레이아웃 드로어(Layout.jsx)와 같은 방식이다. */
  useEffect(() => {
    if (!isDeliveryModalOpen) return;

    /* 모달을 연 버튼. 닫을 때 여기로 포커스를 돌려준다. */
    const opener = document.activeElement;

    document.body.classList.add("modalOpen");

    function focusables() {
      const dialog = modalRef.current;
      if (!dialog) return [];

      return [...dialog.querySelectorAll("button, [href]")].filter(
        (element) => !element.disabled
      );
    }

    focusables()[0]?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDeliveryModalOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const list = focusables();
      if (list.length === 0) return;

      const first = list[0];
      const last = list[list.length - 1];

      /* 끝에서 한 번 더 누르면 반대쪽 끝으로 돌려보내 모달 밖으로 못 나가게 한다. */
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modalOpen");
      opener?.focus?.();
    };
  }, [isDeliveryModalOpen]);

  /* 주문 · 영수증에 남기는 결제수단은 지금 언어로 찍은 이름이다.
     주문 기록과 공유 링크는 그 시점의 화면을 그대로 담는 스냅샷이다. */
  const payName = t(`pay.${PAY_IDS[payIndex]}.name`);
  const usedPoints = Math.round((total * restraint) / 100);

  /* 도파민 게이지는 절제 포인트를 얼마나 썼는지만 그대로 비춘다.
     상태로 두면 다른 곳에서 또 건드리게 되므로 파생값으로 둔다. */
  const dopamine = restraint;

  const dopamineMsg = t(`dopamine.${lastPassed(MESSAGE_STEPS, restraint)}`);

  function changeRestraint(value) {
    setRestraint(value);
  }

  function submit() {
    if (!agreeService || !agreeThrill) {
      setIsWobbling(true);
      toast(t("toast.needsAgree"));
      return;
    }

    const receiptStep = lastPassed(RECEIPT_STEPS, restraint);

    /* 주문이 끝나면 장바구니를 비우므로, 영수증에 쓸 것은 여기서 찍어둔다.
       상품 데이터를 참조하지 않는 스냅샷이라 그대로 링크에 실을 수 있다. */
    setReceipt({
      date: today,
      total,
      payName,
      note: t(`receiptMsg.${receiptStep}.note`),
      grade: t(`receiptMsg.${receiptStep}.grade`),
      itemCount: items.length,
      items: items.map(({ product, qty }) => ({ name: product.name, qty })),
    });

    /* 배송 조회(/delivery)가 읽을 주문을 남긴다. 장바구니가 비워진 뒤에도
       무엇을 "주문한 척"했는지 알아야 하기 때문이다. */
    writeOrder({
      orderNumber: makeOrderNumber(),
      orderedAt: new Date().toISOString(),
      payName,
      total,
      items: items.map(({ product, option, qty }) => ({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        option,
        qty,
        price: product.price,
      })),
    });

    setIsDone(true);
    /* 바로 구매는 장바구니에 담긴 적이 없으니 비울 것도 없다. */
    if (!buyNow) clear();
    window.scrollTo({ top: 0 });

    setConfetti(makeConfetti());
    clearTimeout(confettiTimer.current);
    confettiTimer.current = setTimeout(() => setConfetti([]), CONFETTI_MS);
  }

  /* 주문이 끝나면 장바구니가 비어 있어 주문서로 돌아갈 자리가 없다. 메인에서 다시 담는다. */
  function goShopping() {
    navigate("/");
  }

  /* 영수증 내용을 통째로 담은 링크를 만들어 공유한다.
     공유 시트가 없는 환경(데스크톱 등)에서는 링크를 복사한다. */
  async function bragReceipt() {
    if (!receipt) return;

    const url = receiptUrl(receipt);
    const text = t("share.text", { amount: price(receipt.total) });

    if (navigator.share) {
      try {
        await navigator.share({ title: t("share.title"), text, url });
        return;
      } catch (error) {
        /* 공유 시트를 그냥 닫은 것이므로 복사까지 하지는 않는다. */
        if (error.name === "AbortError") return;

        console.error("공유에 실패했습니다.", error);
      }
    }

    const copied = await copyText(url);

    if (copied) {
      setShareState("copied");
    } else {
      /* 복사가 막힌 환경에서는 성공한 척하지 않고 링크를 띄워 준다. */
      setShareState("blocked");
      toast(url);
    }

    clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(
      () => setShareState("idle"),
      SHARE_RESET_MS
    );
  }

  return (
    <div
      ref={pageRef}
      className={`${styles.page} ${isDone ? styles.isDone : ""}`}
    >
      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={t("back")}
          onClick={goBack}
        >
          <BiChevronLeft aria-hidden="true" />
        </button>

        <h1>{t("title")}</h1>

        <span className={styles.wink}>{t("wink")}</span>

        <AccountMenu />
      </header>

      <div className={styles.wrap}>
        {isDone ? (
          <section className={styles.done} aria-label={t("done.aria")}>
            <div className={styles.doneIn}>
              <span className={styles.stamp}>{t("done.stamp")}</span>

              <h2>
                {t("done.titleLine1")}
                <br />
                {t("done.titleLine2")}
              </h2>

              <p className={styles.lead}>
                {t("done.leadLine1")}
                <br />
                {t("done.leadLine2")}
              </p>

              {/* 장바구니는 이미 비워졌으니 주문 시점에 찍어둔 스냅샷을 쓴다. */}
              <ReceiptCard receipt={receipt} />

              <div className={styles.doneCta}>

                <Link className={styles.btn} to="/delivery">
                  {t("done.delivery")}
                </Link>

                <button
                  type="button"
                  className={styles.ghost}
                  onClick={goShopping}
                >
                  {t("done.again")}
                </button>

                <button
                  type="button"
                  className={styles.ghost}
                  onClick={bragReceipt}
                >
                  {t(`share.${shareState}`)}
                </button>
              </div>
            </div>
          </section>
        ) : items.length === 0 ? (
          /* 장바구니가 비었거나 아무것도 선택하지 않고 주소로 바로 들어온 경우 */
          <section className={styles.empty} aria-label={t("empty.aria")}>
            <strong>{t("empty.title")}</strong>
            <p>{t("empty.lead")}</p>
            <Link className={styles.btn} to="/cart">
              {t("empty.cta")}
            </Link>
          </section>
        ) : (
          <>
            <nav className={styles.steps} aria-label={t("steps.aria")}>
              <div className={styles.step}>
                <b>01</b>
                {t("steps.cart")}
              </div>
              <div className={styles.step} aria-current="step">
                <b>02</b>
                {t("steps.pay")}
              </div>
              <div className={styles.step}>
                <b>03</b>
                {t("steps.notBuy")}
              </div>
            </nav>

            <section className={styles.sec} aria-label={t("items.aria")}>
              <h2>
                {t("items.title")}{" "}
                <small>{t("items.note", { count: items.length })}</small>
              </h2>

              <div>
                {items.map(({ key, product, qty }) => (
                  <article className={styles.item} key={key}>
                    <div className={styles.thumb}>
                      <img
                        src={productImage(product.image)}
                        alt={product.image.alt || product.name}
                        loading="lazy"
                      />
                    </div>

                    <div>
                      <span className={styles.brand}>{product.brand}</span>
                      <div className={styles.name}>
                        {product.name}
                        {qty > 1 && <em> ×{qty}</em>}
                      </div>
                    </div>

                    <div className={`${styles.price} ${styles.strike}`}>
                      {price(product.price * qty)}
                    </div>
                  </article>
                ))}
              </div>

              {/* 이 화면에도 사진이 실리므로 Pexels 출처를 남긴다. (공용 푸터 밖이다) */}
              <p className={styles.credit}>
                {t("imageCredit")}{" "}
                <a
                  href="https://www.pexels.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pexels
                </a>
              </p>
            </section>

            <section className={styles.sec} aria-label={t("address.aria")}>
              <h2>{t("address.title")}</h2>

              <div className={styles.cardLine}>
                <div className={styles.addr}>
                  <b>{t(`delivery.${deliveryId}.name`)}</b>
                  <span>{t(`delivery.${deliveryId}.date`)}</span>
                  <span>{t(`delivery.${deliveryId}.request`)}</span>
                </div>

                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => setIsDeliveryModalOpen(true)}
                >
                  {t("address.change")}
                </button>
              </div>
            </section>

            <section className={styles.sec} aria-label={t("payment.aria")}>
              <h2>
                {t("payment.title")} <small>{t("payment.note")}</small>
              </h2>

              <div
                className={styles.pays}
                role="group"
                aria-label={t("payment.groupAria")}
              >
                {PAY_IDS.map((payId, index) => (
                  <button
                    key={payId}
                    type="button"
                    className={styles.pay}
                    aria-pressed={index === payIndex}
                    onClick={() => setPayIndex(index)}
                  >
                    <b>{t(`pay.${payId}.name`)}</b>
                    <em>{t(`pay.${payId}.desc`)}</em>
                    {payId === RECOMMENDED_PAY_ID && (
                      <span className={styles.rec}>
                        {t("payment.recommended")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section
              className={`${styles.sec} ${styles.slider}`}
              aria-label={t("slider.aria")}
            >
              <h2>
                {t("slider.title")} <small>{t("slider.note")}</small>
              </h2>

              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={restraint}
                aria-label={t("slider.inputAria")}
                /* 채워진 만큼을 CSS가 알아야 해서 값을 변수로 내려준다. */
                style={{ "--fill": `${restraint}%` }}
                onChange={(event) => changeRestraint(Number(event.target.value))}
              />

              <div className={styles.val}>
                <span>
                  {t(`restraint.${lastPassed(MESSAGE_STEPS, restraint)}`)}
                </span>
                <b>{restraint}%</b>
              </div>
            </section>

            <div className={styles.dopa}>
              <div className={styles.dopaTop}>
                <b>{t("gauge.title")}</b>
                <span>{Math.round(dopamine)}%</span>
              </div>

              <div
                className={styles.dbar}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(dopamine)}
              >
                <i style={{ width: `${dopamine}%` }} />
              </div>

              <p>{dopamineMsg}</p>
            </div>

            <section className={styles.sum} aria-label={t("sum.aria")}>
              <div className={styles.row}>
                <span>{t("sum.basket")}</span>
                <span>{price(total)}</span>
              </div>

              <div className={styles.row}>
                <span>{t("sum.restraintPoints")}</span>
                <span>−{price(usedPoints)}</span>
              </div>

              <div className={styles.row}>
                <span>
                  {t("sum.notBuyDiscount")}{" "}
                  <small>{t("sum.notBuyDiscountNote")}</small>
                </span>
                <span>−{price(total - usedPoints)}</span>
              </div>

              <div className={styles.row}>
                <span>{t("sum.shipping")}</span>
                <span>{t("sum.zero")}</span>
              </div>

              <div className={`${styles.row} ${styles.saved}`}>
                <span>{t("sum.saved")}</span>
                <span>{price(total)}</span>
              </div>

              <div className={`${styles.row} ${styles.grand}`}>
                <span>{t("sum.grandTotal")}</span>
                <span>
                  <strong>{t("sum.zero")}</strong>
                </span>
              </div>
            </section>

            <div className={styles.terms}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={agreeService}
                  onChange={(event) => setAgreeService(event.target.checked)}
                />
                <span>
                  <Trans
                    ns="checkout"
                    i18nKey="terms.service"
                    components={{ b: <b /> }}
                  />
                </span>
              </label>

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={agreeThrill}
                  onChange={(event) => setAgreeThrill(event.target.checked)}
                />
                <span>
                  <Trans
                    ns="checkout"
                    i18nKey="terms.thrill"
                    components={{ b: <b /> }}
                  />
                </span>
              </label>

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={agreeNudge}
                  onChange={(event) => setAgreeNudge(event.target.checked)}
                />
                <span>{t("terms.nudge")}</span>
              </label>
            </div>

            <div className={styles.bar} ref={barRef}>
              <div className={styles.barRow}>
                <span>
                  {t("bar.summary", { payName, percent: restraint })}
                </span>
                <strong>{t("sum.zero")}</strong>
              </div>

              <button
                type="button"
                className={`${styles.btn} ${isWobbling ? styles.wob : ""}`}
                onClick={submit}
                onAnimationEnd={() => setIsWobbling(false)}
              >
                {t("bar.submit")}
              </button>

              <button
                type="button"
                className={styles.anyway}
                disabled={isAnywayPressed}
                onClick={() => setIsAnywayPressed(true)}
              >
                {isAnywayPressed ? t("bar.anywayPressed") : t("bar.anyway")}
              </button>

              <p className={styles.tiny}>{t("bar.tiny")}</p>
            </div>

            <section className={styles.brag} aria-label={t("brag.aria")}>
              <h2>{t("brag.title")}</h2>

              <div className={styles.stats}>
                {STAT_IDS.map((statId) => (
                  <div className={styles.stat} key={statId}>
                    <b>{t(`stats.${statId}.value`)}</b>
                    <span>{t(`stats.${statId}.label`)}</span>
                  </div>
                ))}
              </div>
            </section>

            <p className={styles.disclaim}>
              {t("disclaimLine1")}
              <br />
              {t("disclaimLine2")}
              <br />
              {t("disclaimLine3")}
            </p>
          </>
        )}
      </div>

      {confetti.length > 0 && (
        <div className={styles.confetti} aria-hidden="true">
          {/* 조각 하나가 두 겹인 이유는 CSS 쪽 주석 참고 — 떨어지는 것과
              뒤집히는 것을 한 요소의 transform에 함께 걸 수 없다. */}
          {confetti.map(({ id, shape, style }) => (
            <i key={id} className={styles[shape]} style={style}>
              <b />
            </i>
          ))}
        </div>
      )}

      {isDeliveryModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsDeliveryModalOpen(false)}
        >
          <div
            ref={modalRef}
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="delivery-modal-title">{t("address.modalTitle")}</h2>

              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsDeliveryModalOpen(false)}
                aria-label={t("address.close")}
              >
                ×
              </button>
            </div>

            <div className={styles.deliveryList}>
              {DELIVERY_IDS.map((id, index) => (
                <button
                  type="button"
                  key={id}
                  className={styles.deliveryOption}
                  aria-pressed={deliveryIndex === index}
                  onClick={() => {
                    setDeliveryIndex(index);
                    setIsDeliveryModalOpen(false);
                  }}
                >
                  <span>{deliveryIndex === index ? "●" : "○"}</span>
                  {t(`delivery.${id}.name`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
