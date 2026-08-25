import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import styles from "./Delivery.module.css";
import { findProduct, productImage } from "../../data/products";
import { clearOrder, readOrder } from "../../order/orderStorage";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";
import { MISSION } from "../../coupon/hiddenStorage";
import useGoBack from "../../hooks/useGoBack";
import AccountMenu from "../../components/AccountMenu";
import usePrice from "../../lib/usePrice";

import { BiChevronLeft } from "react-icons/bi";

/* 지점 이름과 안내 문구는 delivery.json의 steps가 들고, 여기엔 좌표만 남긴다. */
const DELIVERY_STEPS = [
  { id: "paid", x: 86, y: 332 },
  { id: "warehouse", x: 192, y: 232 },
  { id: "packing", x: 310, y: 150 },
  { id: "hub", x: 450, y: 305 },
  { id: "nearby", x: 570, y: 230 },
  { id: "door", x: 732, y: 84 },
];

const ROUTE_PATH = `M86 332 C145 292, 160 250, 192 232
  C235 204, 256 148, 310 150
  C370 152, 386 294, 450 305
  C510 316, 514 244, 570 230
  C645 211, 654 105, 732 84`;

/* 지도 배경: 경로 주변을 비워 둔 블록 · 물길 · 이면도로 */
const MAP_BLOCKS = [
  { x: 20, y: 24, w: 132, h: 74 },
  { x: 202, y: 30, w: 94, h: 76 },
  { x: 380, y: 28, w: 138, h: 62 },
  { x: 560, y: 24, w: 108, h: 50 },
  { x: 20, y: 142, w: 108, h: 114 },
  { x: 250, y: 252, w: 92, h: 116 },
  { x: 604, y: 292, w: 168, h: 86 },
];

const MAP_PARKS = [
  { x: 168, y: 330, w: 104, h: 66 },
  { x: 664, y: 168, w: 112, h: 74 },
];

const MINOR_ROADS = [
  "M0 118 H820",
  "M0 268 H820",
  "M170 0 V420",
  "M352 0 V420",
  "M628 0 V420",
];

/* 지명은 delivery.json의 areas가 들고, 여기엔 놓일 자리만 남긴다. */
const AREA_LABELS = [
  { id: "cart", x: 62, y: 200, rotate: -4 },
  { id: "rationalize", x: 300, y: 214, rotate: -3 },
  { id: "coupon", x: 470, y: 118, rotate: -2 },
  { id: "impulse", x: 452, y: 372, rotate: -3 },
  { id: "home", x: 700, y: 268, rotate: -3 },
];

/* ── 색종이 ────────────────────────────
   움직임은 Checkout의 색종이와 같다. 색만 이 페이지의 파랑 계열을 그대로 둔다. */
const CONFETTI_COLORS = [
  "#4b70d3",
  "#2b4798",
  "#93a9e6",
  "#1c1e24",
  "#dce3f8",
  "#6c8add",
];

/* 사각형만 쓰면 비처럼 보인다. 사각형을 두 번 넣어 기본으로 두고,
   동그라미와 긴 리본을 섞는다. 리본은 더 느리게 떨어진다. */
const CONFETTI_SHAPES = ["cRect", "cRect", "cRound", "cRibbon"];

const CONFETTI_COUNT = 200;

/* 가장 늦은 조각(지연 1.4s + 낙하 4.2s)이 화면을 다 지나간 뒤에 지운다. */
const CONFETTI_MS = 5800;

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
           .confettiPieces가 overflow: hidden이라 잘려도 문제없다. */
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

/* 주문 없이 /delivery로 바로 들어온 경우. 푸터의 "없는 제품 배송 조회"로도
   들어올 수 있으니 배송 연출은 그대로 두고, 상품 목록만 비운다.
   주문번호는 화면에 보이는 문구라 그릴 때 delivery.json에서 가져온다. */
const SAMPLE_ORDER = {
  orderNumber: null,
  payName: "",
  total: 0,
  items: [],
};

const DELIVERY_SECONDS = 25;

export default function Delivery() {
  const { t } = useTranslation("delivery");
  const price = usePrice();
  const goBack = useGoBack();
  const [elapsed, setElapsed] = useState(0);
  const [confetti, setConfetti] = useState([]);

  /* 주문서(Checkout)가 localStorage에 남긴 주문. 첫 렌더에 한 번만 읽는다.
     배송이 끝나면 저장소에서는 지우지만 화면은 그대로 두어야 하므로,
     읽은 값은 상태로 들고 있는다. */
  const [order] = useState(() => readOrder() ?? SAMPLE_ORDER);
  const { unlock } = useHiddenCoupon();
  const isRealOrder = order !== SAMPLE_ORDER;

  useEffect(() => {
    if (elapsed >= DELIVERY_SECONDS) return;

    const timer = window.setTimeout(() => {
      setElapsed((current) => Math.min(current + 1, DELIVERY_SECONDS));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [elapsed]);

  const stepIndex = Math.min(
    Math.floor(elapsed / 5),
    DELIVERY_STEPS.length - 1
  );
  const currentStep = DELIVERY_STEPS[stepIndex];
  const nextStep = DELIVERY_STEPS[stepIndex + 1] ?? null;
  const remaining = Math.max(0, DELIVERY_SECONDS - elapsed);
  const progress = Math.min(100, (elapsed / DELIVERY_SECONDS) * 100);
  const isDelivered = elapsed >= DELIVERY_SECONDS;
  const isRerouting = elapsed >= 15 && elapsed < 20;

  /* 도착하는 순간 한 번 뿌리고 다 지나간 뒤 지운다. 다시 배송을 돌리면
     (restartDelivery) isDelivered가 내려갔다 올라오면서 새로 흩뿌려진다.
     축하 카드는 스스로 사라지므로(celebrationExit) 껍데기는 그대로 둔다. */
  useEffect(() => {
    if (!isDelivered) return;

    setConfetti(makeConfetti());
    const timer = window.setTimeout(() => setConfetti([]), CONFETTI_MS);

    return () => window.clearTimeout(timer);
  }, [isDelivered]);

  /* 배송이 끝나면 저장된 주문을 지운다. 다 온 주문을 계속 추적할 이유가 없고,
     다음에 /delivery를 열면 견본으로 돌아간다. */
  useEffect(() => {
    if (isDelivered && isRealOrder) clearOrder();
  }, [isDelivered, isRealOrder]);

  /* 사진은 무거워서 저장하지 않았다. productId로 지금 products.js에서 찾는다. */
  const orderItems = useMemo(
    () =>
      order.items.map((item) => {
        const product = findProduct(item.productId);

        return {
          ...item,
          image: product ? productImage(product.image) : null,
          alt: product?.image.alt || item.name,
        };
      }),
    [order]
  );

  const orderTotal = order.total;

  function restartDelivery() {
    setElapsed(0);
    window.scrollTo({ top: 0, behavior: "smooth" });

    /* 숨은 쿠폰. 이미 받았으면 아무 일도 일어나지 않는다. */
    unlock(MISSION.DELIVERY_REPLAY);
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={t("back")}
          onClick={goBack}
        >
          <BiChevronLeft aria-hidden="true" />
        </button>

        <h1 className={styles.headerTitle}>{t("headerTitle")}</h1>

        <AccountMenu />
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <span>{t("intro.eyebrow")}</span>
          <h1>
            {t("intro.titleLine1")}
            <br />
            {t("intro.titleLine2")}
          </h1>
          <p>{t("intro.lead")}</p>
        </section>

        <div className={styles.trackingLayout}>
          <section className={styles.mapPanel} aria-labelledby="map-title">
            <div className={styles.mapHead}>
              <div>
                <span>{t("map.eyebrow")}</span>
                <h2 id="map-title">{t("map.title")}</h2>
              </div>
              <strong className={isDelivered ? styles.etaDone : undefined}>
                {isDelivered
                  ? t("map.etaDone")
                  : t("map.etaRemaining", { seconds: remaining })}
              </strong>
            </div>

            <div className={styles.fakeMap}>
              <svg
                viewBox="0 0 820 420"
                role="img"
                aria-label={t("map.svgAria")}
              >
                <g aria-hidden="true">
                  <path
                    className={styles.water}
                    d="M498 -20 C520 70, 470 150, 508 220 C544 288, 512 356, 546 440
                       L618 440 C580 352, 616 288, 578 216 C542 148, 592 68, 570 -20 Z"
                  />
                  <path
                    className={styles.water}
                    d="M-20 372 C60 356, 118 396, 176 440 L-20 440 Z"
                  />

                  <g className={styles.minorRoads}>
                    {MINOR_ROADS.map((d) => (
                      <path d={d} key={d} />
                    ))}
                  </g>

                  <g className={styles.parks}>
                    {MAP_PARKS.map((park) => (
                      <rect
                        key={`${park.x}-${park.y}`}
                        x={park.x}
                        y={park.y}
                        width={park.w}
                        height={park.h}
                        rx="4"
                      />
                    ))}
                  </g>

                  <g className={styles.mapBlocks}>
                    {MAP_BLOCKS.map((block) => (
                      <rect
                        key={`${block.x}-${block.y}`}
                        x={block.x}
                        y={block.y}
                        width={block.w}
                        height={block.h}
                        rx="3"
                      />
                    ))}
                  </g>

                  {/* 물길을 건너는 다리 */}
                  <g className={styles.bridge}>
                    <line x1="498" y1="252" x2="562" y2="268" />
                  </g>

                  <g className={styles.areaLabels}>
                    {AREA_LABELS.map((label) => (
                      <text
                        key={label.id}
                        x={label.x}
                        y={label.y}
                        textAnchor="middle"
                        transform={`rotate(${label.rotate} ${label.x} ${label.y})`}
                      >
                        {t(`areas.${label.id}`)}
                      </text>
                    ))}
                  </g>
                </g>

                <path className={styles.routeCasing} d={ROUTE_PATH} />
                <path className={styles.road} pathLength="100" d={ROUTE_PATH} />
                <path
                  className={styles.routeProgress}
                  pathLength="100"
                  style={{ strokeDashoffset: 100 - progress }}
                  d={ROUTE_PATH}
                />

                {DELIVERY_STEPS.map((step, index) => (
                  <g
                    className={`${styles.point} ${
                      index <= stepIndex ? styles.pointPassed : ""
                    }`}
                    key={step.id}
                  >
                    <circle cx={step.x} cy={step.y} r="7" />
                    <text
                      x={step.x}
                      y={step.y + (index % 2 === 0 ? 26 : -18)}
                      textAnchor="middle"
                    >
                      {t(`steps.${step.id}.place`)}
                    </text>
                  </g>
                ))}

                <g
                  className={styles.deliveryMarker}
                  style={{
                    transform: `translate(${currentStep.x}px, ${currentStep.y}px)`,
                  }}
                >
                  <circle className={styles.markerBody} r="15" />
                  <g className={styles.markerIcon}>
                    <rect x="-7" y="-5.5" width="14" height="11" rx="1.5" />
                    <line x1="-7" y1="-1" x2="7" y2="-1" />
                    <line x1="0" y1="-5.5" x2="0" y2="-1" />
                  </g>
                </g>
              </svg>

              <div className={styles.mapChrome} aria-hidden="true">
                <span className={styles.compass}>N</span>
                <div className={styles.zoom}>
                  <span>+</span>
                  <span>−</span>
                </div>
              </div>

              {isRerouting && (
                <p className={styles.mapToast} role="status">
                  <strong>{t("map.rerouteStrong")}</strong>
                  {t("map.rerouteRest")}
                </p>
              )}

              <div className={styles.mapCaption}>
                <p>{t("map.caption")}</p>
                <span className={styles.scaleBar} aria-hidden="true">
                  <i />
                  {t("map.scale")}
                </span>
              </div>
            </div>
          </section>

          <aside className={styles.deliveryCard} aria-live="polite">
            <div className={styles.statusHead}>
              <span>
                {isDelivered ? t("status.delivered") : t("status.inTransit")}
              </span>
              <strong>
                {isDelivered
                  ? t("status.arrived")
                  : t("status.seconds", { seconds: remaining })}
              </strong>
            </div>

            <h2>
              <Trans
                ns="delivery"
                i18nKey="card.title"
                values={{ place: t(`steps.${currentStep.id}.place`) }}
                components={{ br: <br /> }}
              />
            </h2>

            <p className={styles.currentMessage}>
              {t(`steps.${currentStep.id}.message`)}
            </p>

            <div className={styles.progressRow}>
              <span>{t("card.progress")}</span>
              <strong>{Math.round(progress)}%</strong>
            </div>
            <div className={styles.progress}>
              <span style={{ width: `${progress}%` }} />
            </div>

            <dl className={styles.summary}>
              <div>
                <dt>{t("card.nextStop")}</dt>
                <dd>
                  {nextStep
                    ? t(`steps.${nextStep.id}.place`)
                    : t("card.noMore")}
                </dd>
              </div>
              <div>
                <dt>{t("card.timeLeft")}</dt>
                <dd>
                  {isDelivered
                    ? t("card.zeroSeconds")
                    : t("card.aboutSeconds", { seconds: remaining })}
                </dd>
              </div>
              <div>
                <dt>{t("card.orderNumber")}</dt>
                <dd>{order.orderNumber ?? t("sampleOrderNumber")}</dd>
              </div>
              {order.payName && (
                <div>
                  <dt>{t("card.payMethod")}</dt>
                  <dd>{order.payName}</dd>
                </div>
              )}
            </dl>

            <div className={styles.orderItems}>
              <h3>{t("card.itemsTitle")}</h3>

              {/* 담은 것이 없으면 빈 목록 대신 안내 문구 한 줄만 남긴다. */}
              {orderItems.length === 0 ? (
                <p className={styles.sampleNote}>{t("card.emptyNote")}</p>
              ) : (
                <>
                  {orderItems.map((item, index) => (
                    <article key={`${item.productId}-${item.option}-${index}`}>
                      {/* 상품이 products.json에서 사라졌으면 자리만 비워 둔다. */}
                      {item.image ? (
                        <img src={item.image} alt={item.alt} />
                      ) : (
                        <span className={styles.noImage} aria-hidden="true" />
                      )}
                      <div>
                        <small>{item.brand}</small>
                        <strong>{item.name}</strong>
                        <span>
                          {t("card.itemLine", {
                            qty: item.qty,
                            amount: price(item.price * item.qty),
                          })}
                        </span>
                      </div>
                    </article>
                  ))}
                  <p>
                    {t("card.basket")} <strong>{price(orderTotal)}</strong>
                  </p>
                </>
              )}
            </div>

            <button type="button" onClick={restartDelivery}>
              {t("card.restart")}
            </button>
          </aside>
        </div>

        <section className={styles.timeline} aria-labelledby="timeline-title">
          <div>
            <span>{t("timeline.eyebrow")}</span>
            <h2 id="timeline-title">{t("timeline.title")}</h2>
          </div>

          <ol>
            {DELIVERY_STEPS.map((step, index) => (
              <li
                key={step.id}
                aria-current={index === stepIndex ? "step" : undefined}
                className={index < stepIndex ? styles.completed : undefined}
              >
                <span>
                  {t("timeline.second", {
                    second: String(index * 5).padStart(2, "0"),
                  })}
                </span>
                <div>
                  <strong>{t(`steps.${step.id}.place`)}</strong>
                  <p>{t(`steps.${step.id}.message`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <p className={styles.disclaimer}>{t("disclaimer")}</p>

        {isDelivered && (
          <div className={styles.confetti} aria-live="polite">
            {confetti.length > 0 && (
              <div className={styles.confettiPieces} aria-hidden="true">
                {/* 조각 하나가 두 겹인 이유는 CSS 쪽 주석 참고 — 떨어지는 것과
                    뒤집히는 것을 한 요소의 transform에 함께 걸 수 없다. */}
                {confetti.map(({ id, shape, style }) => (
                  <i key={id} className={styles[shape]} style={style}>
                    <b />
                  </i>
                ))}
              </div>
            )}
            <div className={styles.celebration}>
              <span>{t("done.eyebrow")}</span>
              <strong>{t("done.title")}</strong>
              <p>{t("done.lead")}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
