import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Delivery.module.css";
import { PRODUCTS, findProduct, productImage, won } from "../../data/products";
import { clearOrder, readOrder } from "../../order/orderStorage";
import useHiddenCoupon from "../../coupon/useHiddenCoupon";
import { MISSION } from "../../coupon/hiddenStorage";

const DELIVERY_STEPS = [
  {
    place: "결제완료동",
    message: "주문한 척이 접수되었습니다.",
    x: 86,
    y: 332,
  },
  {
    place: "없는 상품 보관소",
    message: "창고에 없는 상품을 찾고 있습니다.",
    x: 192,
    y: 232,
  },
  {
    place: "빈 상자 포장센터",
    message: "빈 상자를 정성스럽게 포장했습니다.",
    x: 310,
    y: 150,
  },
  {
    place: "굳이 들른 중간 허브",
    message: "최단 경로를 두고 굳이 돌아갑니다.",
    x: 450,
    y: 305,
  },
  {
    place: "고객님 근처인 척",
    message: "제법 가까워 보이지만 그렇지 않습니다.",
    x: 570,
    y: 230,
  },
  {
    place: "마음속 현관문",
    message: "고객님의 마음속에 배송되었습니다.",
    x: 732,
    y: 84,
  },
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

const AREA_LABELS = [
  { x: 62, y: 200, text: "장바구니구", rotate: -4 },
  { x: 300, y: 214, text: "합리화대로", rotate: -3 },
  { x: 470, y: 118, text: "쿠폰 57장 교차로", rotate: -2 },
  { x: 452, y: 372, text: "충동구매로", rotate: -3 },
  { x: 700, y: 268, text: "아무것도 오지 않는 집", rotate: -3 },
];

const CONFETTI_PIECES = Array.from({ length: 72 }, (_, index) => ({
  id: index,
  x: `${(index * 37) % 100}%`,
  delay: `${(index % 16) * 0.08}s`,
  duration: `${2.4 + (index % 7) * 0.22}s`,
  drift: `${(index % 2 === 0 ? 1 : -1) * (30 + (index % 6) * 14)}px`,
  rotate: `${360 + (index % 5) * 180}deg`,
  color: ["#4b70d3", "#2b4798", "#93a9e6", "#1c1e24", "#dce3f8", "#6c8add"][
    index % 6
  ],
}));

/* 주문 없이 /delivery로 바로 들어온 경우에 보여줄 견본.
   푸터의 "없는 제품 배송 조회"로도 들어올 수 있어 화면이 비면 안 된다. */
const SAMPLE_ORDER = {
  orderNumber: "ANSAM-아까있었음",
  payName: "",
  total: PRODUCTS.slice(0, 2).reduce(
    (sum, product, index) => sum + product.price * (index + 1),
    0
  ),
  items: PRODUCTS.slice(0, 2).map((product, index) => ({
    productId: product.id,
    name: product.name,
    brand: product.brand,
    option: "",
    qty: index + 1,
    price: product.price,
  })),
};

const DELIVERY_SECONDS = 25;

export default function Delivery() {
  const [elapsed, setElapsed] = useState(0);

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
        <Link className={styles.brand} to="/">
          안삼 <span>STORE</span>
        </Link>
        <p>실시간인 척 배송 조회</p>
      </header>

      <main className={styles.main}>
        <section className={styles.intro}>
          <span>IMAGINARY TRACKING SERVICE</span>
          <h1>
            고객님의 기대와
            <br />
            현실 사이
          </h1>
          <p>
            위치 권한도, 지도 API도 사용하지 않습니다. 없는 상품이 마음속
            현관문까지 가는 25초를 함께 지켜봐 주세요.
          </p>
        </section>

        <div className={styles.trackingLayout}>
          <section className={styles.mapPanel} aria-labelledby="map-title">
            <div className={styles.mapHead}>
              <div>
                <span>FAKE DELIVERY MAP</span>
                <h2 id="map-title">가짜 배송 세계지도</h2>
              </div>
              <strong className={isDelivered ? styles.etaDone : undefined}>
                {isDelivered ? "상상 배송 완료" : `${remaining}초 후 배송 완료`}
              </strong>
            </div>

            <div className={styles.fakeMap}>
              <svg
                viewBox="0 0 820 420"
                role="img"
                aria-label="존재하지 않는 상품의 상상 배송 경로"
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
                        key={label.text}
                        x={label.x}
                        y={label.y}
                        textAnchor="middle"
                        transform={`rotate(${label.rotate} ${label.x} ${label.y})`}
                      >
                        {label.text}
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
                    key={step.place}
                  >
                    <circle cx={step.x} cy={step.y} r="7" />
                    <text
                      x={step.x}
                      y={step.y + (index % 2 === 0 ? 26 : -18)}
                      textAnchor="middle"
                    >
                      {step.place}
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
                  <strong>배송 경로를 재탐색했습니다.</strong>
                  애초에 목적지가 없었기 때문입니다.
                </p>
              )}

              <div className={styles.mapCaption}>
                <p>
                  본 지도는 실제 위치와 관련이 없으며, 배송 기사님도 존재하지
                  않습니다.
                </p>
                <span className={styles.scaleBar} aria-hidden="true">
                  <i />
                  상상 500m
                </span>
              </div>
            </div>
          </section>

          <aside className={styles.deliveryCard} aria-live="polite">
            <div className={styles.statusHead}>
              <span>{isDelivered ? "배송 완료" : "상상 배송 중"}</span>
              <strong>{isDelivered ? "도착" : `${remaining}초`}</strong>
            </div>

            <h2>
              고객님의 상품이
              <br />
              {currentStep.place}에 도착했습니다.
            </h2>

            <p className={styles.currentMessage}>{currentStep.message}</p>

            <div className={styles.progressRow}>
              <span>배송 진행</span>
              <strong>{Math.round(progress)}%</strong>
            </div>
            <div className={styles.progress}>
              <span style={{ width: `${progress}%` }} />
            </div>

            <dl className={styles.summary}>
              <div>
                <dt>다음 목적지</dt>
                <dd>{nextStep?.place ?? "더 이상 없음"}</dd>
              </div>
              <div>
                <dt>남은 배송 시간</dt>
                <dd>{isDelivered ? "0초" : `약 ${remaining}초`}</dd>
              </div>
              <div>
                <dt>주문번호</dt>
                <dd>{order.orderNumber}</dd>
              </div>
              {order.payName && (
                <div>
                  <dt>결제수단</dt>
                  <dd>{order.payName}</dd>
                </div>
              )}
            </dl>

            <div className={styles.orderItems}>
              <h3>주문한 척한 상품</h3>

              {!isRealOrder && (
                <p className={styles.sampleNote}>
                  최근 주문이 없어 견본을 띄웠습니다. 주문서에서 0원 결제를
                  마치면 그 내역이 여기로 올라옵니다.
                </p>
              )}

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
                      {item.qty}개 · {won(item.price * item.qty)}
                    </span>
                  </div>
                </article>
              ))}
              <p>
                담았던 금액 <strong>{won(orderTotal)}</strong>
              </p>
            </div>

            <button type="button" onClick={restartDelivery}>
              배송 기록 다시 만들어보기
            </button>
          </aside>
        </div>

        <section className={styles.timeline} aria-labelledby="timeline-title">
          <div>
            <span>25 SECOND JOURNEY</span>
            <h2 id="timeline-title">배송 단계</h2>
          </div>

          <ol>
            {DELIVERY_STEPS.map((step, index) => (
              <li
                key={step.place}
                aria-current={index === stepIndex ? "step" : undefined}
                className={index < stepIndex ? styles.completed : undefined}
              >
                <span>{String(index * 5).padStart(2, "0")}초</span>
                <div>
                  <strong>{step.place}</strong>
                  <p>{step.message}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <p className={styles.disclaimer}>
          안삼의 배송 조회는 실제 주문, 위치 정보, 택배사 API와 연결되어 있지
          않습니다. 개인정보도 받지 않고 상품도 보내지 않습니다.
        </p>

        {isDelivered && (
          <div className={styles.confetti} aria-live="polite">
            <div className={styles.confettiPieces} aria-hidden="true">
              {CONFETTI_PIECES.map((piece) => (
                <i
                  key={piece.id}
                  style={{
                    "--x": piece.x,
                    "--delay": piece.delay,
                    "--duration": piece.duration,
                    "--drift": piece.drift,
                    "--rotate": piece.rotate,
                    "--confetti-color": piece.color,
                  }}
                />
              ))}
            </div>
            <div className={styles.celebration}>
              <span>DELIVERY COMPLETE!</span>
              <strong>마음속 배송 완료!</strong>
              <p>상품을 마음속 공동현관 앞에 안전하게 두었습니다.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
