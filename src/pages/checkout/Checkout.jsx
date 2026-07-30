import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Checkout.module.css";
import { productImage, won } from "../../data/products";
import { useCart } from "../../cart/CartProvider";
import useGoBack from "../../hooks/useGoBack";

import { BiChevronLeft } from "react-icons/bi";

const PAY_METHODS = [
  { name: "눈으로 결제", desc: "보기만 하고 닫기", recommended: true },
  { name: "상상페이", desc: "잔액 무한", recommended: false },
  { name: "참을성 카드", desc: "36개월 무이자", recommended: false },
  { name: "스크린샷 이체", desc: "저장만 하기", recommended: false },
];

/* 절제 비율에 따라 마지막으로 통과한 문구를 쓴다. */
const RESTRAINT_MESSAGES = [
  [0, "절제 0% — 위험합니다"],
  [5, "절제 시도 감지 — 아직 흔들립니다"],
  [10, "첫 저항 성공 — 손이 결제 버튼에서 떨어졌습니다"],
  [15, "이성 작동 중 — 충동을 잠시 눌렀습니다"],
  [20, "초기 방어 성공 — 지금까진 잘 버티는 중"],
  [25, "절제 루틴 진입 — 생각보다 잘 참는 중입니다"],
  [30, "안정권 진입 — 장바구니와 거리 유지 중"],
  [35, "자제력 상승 — 구매욕이 약해지고 있습니다"],
  [40, "흔들리지만 버팀 — 제법 훌륭합니다"],
  [45, "중간 방어선 유지 — 거의 절반 왔습니다"],
  [50, "절제 절반 달성 — 반은 이겼습니다"],
  [55, "자기통제 우수 — 꽤 강해졌습니다"],
  [60, "고비 통과 — 이제 쉽게 무너지지 않습니다"],
  [65, "안정적 절제 상태 — 충동보다 이성이 앞섭니다"],
  [70, "상급 절제력 — 결제 직전도 버틸 수 있습니다"],
  [75, "매우 양호 — 소비욕을 잘 길들이는 중"],
  [80, "절제 전문가 모드 — 거의 흔들리지 않습니다"],
  [85, "강철 멘탈 — 유혹을 즐기며 피하는 단계"],
  [90, "최상위 절제력 — 장바구니를 이겼습니다"],
  [95, "거의 완벽 — 소비 충동 제압 완료"],
  [100, "절제 만렙 — 오늘의 지름신을 완전히 봉인했습니다"],
];

/* 도파민 게이지 비율에 따라 마지막으로 통과한 문구를 쓴다. */
const DOPAMINE_MESSAGES = [
  [0, "아직 아무것도 안 참았습니다."],
  [5, "도파민이 아주 미세하게 반응했습니다."],
  [10, "“안 사도 된다”는 기분이 10% 충전되었습니다."],
  [15, "참은 보람이 조금씩 쌓이고 있습니다."],
  [20, "소소한 뿌듯함이 발생했습니다."],
  [25, "도파민이 은근히 오릅니다. 괜히 기특합니다."],
  [30, "“오늘 나 제법 괜찮은데?” 게이지가 활성화되었습니다."],
  [35, "만족감이 슬금슬금 차오릅니다."],
  [40, "참는 재미를 알아가는 단계입니다."],
  [45, "도파민이 본격적으로 붙기 시작했습니다."],
  [50, "뿌듯함 50% 달성. 스스로 칭찬할 타이밍입니다."],
  [55, "아무것도 안 샀는데 기분이 좋아집니다."],
  [60, "절제가 보상으로 전환되고 있습니다."],
  [65, "가짜 쇼핑의 참맛을 알아버렸습니다."],
  [70, "도파민이 넉넉하게 차오르고 있습니다."],
  [75, "꽤 큰 만족감이 발생했습니다. 괜히 이긴 기분입니다."],
  [80, "“안 샀다”는 사실만으로도 기분이 좋습니다."],
  [85, "도파민 과충전 직전입니다. 표정 관리가 필요합니다."],
  [90, "엄청난 성취감이 밀려옵니다. 안 샀는데 이겼습니다."],
  [95, "도파민이 거의 최대치입니다. 아주 만족스럽습니다."],
  [100, "도파민 최대치! 아무것도 사지 않았지만 마음만은 풀결제 완료."],
];

const DELIVERY_MESSAGES = [
  [
    "당신의 상상 속 방 한 칸",
    "도착 예정: 마음속에 자리를 비우는 즉시",
    "요청사항: 문 앞에 두고 가세요. 질문은 사양합니다.",
  ],
  [
    "통장 잔고가 안전한 곳",
    "도착 예정: 결제 충동이 완전히 지나간 뒤",
    "요청사항: 카드 명세서에 흔적을 남기지 마세요.",
  ],
  [
    "결제 욕구가 닿지 않는 곳",
    "도착 예정: 사고 싶은 마음이 포기하는 즉시",
    "요청사항: 주소를 결제 버튼에는 절대 알려주지 마세요.",
  ],
  [
    "마음속 현관문 앞",
    "도착 예정: 이미 도착했습니다. 마음으로 수령해 주세요.",
    "요청사항: 벨은 누르지 마세요. 괜히 현실로 돌아옵니다.",
  ],
  [
    "오늘 밤 꿈속 택배함",
    "도착 예정: 오늘 밤 잠든 후 2~3개의 꿈 이내",
    "요청사항: 깨지 않게 조용히 넣어주세요. 아침에는 사라져도 괜찮습니다.",
  ],
];

const STATS = [
  ["14일", "연속 안 삼"],
  ["3,482,000원", "누적 아낀 금액"],
  ["절제 장인", "현재 등급"],
  ["상위 3%", "이번 주 순위"],
];

const CONFETTI_COLORS = ["#4b70d3", "#2b4798", "#93a9e6", "#1c1e24", "#dce3f8"];
const CONFETTI_COUNT = 70;
const CONFETTI_MS = 3600;

/* 도파민 게이지 비율에 따라 마지막으로 통과한 문구를 반환 */
function dopamineMessage(percent) {
  let message = DOPAMINE_MESSAGES[0][1];

  for (const [requiredPercent, text] of DOPAMINE_MESSAGES) {
    if (percent < requiredPercent) break;

    message = text;
  }

  return message;
}

function restraintMessage(percent) {
  const matched = RESTRAINT_MESSAGES.filter(([edge]) => percent >= edge);
  return matched[matched.length - 1][1];
}

function makeConfetti() {
  return Array.from({ length: CONFETTI_COUNT }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}vw`,
    background: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    animationDuration: `${1.6 + Math.random() * 1.4}s`,
    animationDelay: `${Math.random() * 0.5}s`,
    width: `${5 + Math.random() * 6}px`,
    height: `${10 + Math.random() * 10}px`,
  }));
}

export default function Checkout() {
  const goBack = useGoBack("/cart");
  const navigate = useNavigate();
  const { items: cartItems, clear } = useCart();

  const [payIndex, setPayIndex] = useState(0);
  /* 절제 포인트는 0%에서 시작해서 사용자가 직접 올린다. */
  const [restraint, setRestraint] = useState(0);
  /* 절제 포인트가 0%로 시작하므로 문구도 0% 것으로 맞춰 연다. */
  const [dopamineMsg, setDopamineMsg] = useState(() => dopamineMessage(0));
  const [agreeService, setAgreeService] = useState(true);
  const [agreeThrill, setAgreeThrill] = useState(true);
  const [agreeNudge, setAgreeNudge] = useState(false);
  const [isWobbling, setIsWobbling] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [anywayLabel, setAnywayLabel] = useState("그래도 진짜로 사고 싶어요");
  const isDisabled = anywayLabel === "여기서는 살 수 없습니다. 그게 이 사이트의 기능입니다.";
  const [shareLabel, setShareLabel] = useState("자랑 문구 복사하기");

  const confettiTimer = useRef(null);

  const [deliveryIndex, setDeliveryIndex] = useState(0);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  const [deliveryName, deliveryDate, deliveryRequest] =
    DELIVERY_MESSAGES[deliveryIndex];

  /* 주문서에는 장바구니에서 선택한 줄만 올린다. */
  const items = useMemo(
    () => cartItems.filter((item) => item.selected),
    [cartItems]
  );

  const total = items.reduce(
    (sum, { product, qty }) => sum + product.price * qty,
    0
  );

  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date());

  useEffect(() => () => clearTimeout(confettiTimer.current), []);

  const payName = PAY_METHODS[payIndex].name;
  const usedPoints = Math.round((total * restraint) / 100);

  /* 도파민 게이지는 절제 포인트를 얼마나 썼는지만 그대로 비춘다.
     상태로 두면 다른 곳에서 또 건드리게 되므로 파생값으로 둔다. */
  const dopamine = restraint;

  function changeRestraint(value) {
    setRestraint(value);
    setDopamineMsg(dopamineMessage(value));
  }

  function submit() {
    if (!agreeService || !agreeThrill) {
      setIsWobbling(true);
      setDopamineMsg(
        "필수 항목에 동의해 주세요. 아무것도 안 사려면 절차는 지켜야 합니다."
      );
      return;
    }

    /* 주문이 끝나면 장바구니를 비우므로, 영수증에 쓸 것은 여기서 찍어둔다. */
    setReceipt({
      payName,
      note:
        restraint === 100
          ? "절제 포인트 전액 사용. 교과서적인 안 삼입니다."
          : `절제 포인트는 ${restraint}%만 썼지만, 나머지는 안 삼 할인이 알아서 막았습니다.`,
      grade: restraint === 100 ? "등급 승급 임박" : "절제 훈련 필요",
      items,
      total,
    });

    setIsDone(true);
    clear();
    window.scrollTo({ top: 0 });

    setConfetti(makeConfetti());
    clearTimeout(confettiTimer.current);
    confettiTimer.current = setTimeout(() => setConfetti([]), CONFETTI_MS);
  }

  /* 주문이 끝나면 장바구니가 비어 있어 주문서로 돌아갈 자리가 없다. 메인에서 다시 담는다. */
  function goShopping() {
    navigate("/");
  }

  function copyBrag() {
    /* 자랑은 완료 화면에서만 누르므로 영수증에 찍힌 금액을 쓴다. */
    const text = `오늘 안삼에서 ${won(receipt?.total ?? total)} 안 썼습니다. 15일 연속 안 삼.`;

    navigator.clipboard?.writeText(text);
    setShareLabel("복사했습니다. 마음껏 자랑하세요");
  }

  return (
    <div className={`${styles.page} ${isDone ? styles.isDone : ""}`}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="장바구니로"
          onClick={goBack}
        >
          <BiChevronLeft size={22} aria-hidden="true" />
        </button>

        <h1>결제하기</h1>

        <span className={styles.wink}>돈은 안 나갑니다</span>
      </header>

      <div className={styles.wrap}>
        {isDone ? (
          <section className={styles.done} aria-label="결제 완료">
            <div className={styles.doneIn}>
              <span className={styles.stamp}>안 삼 완료</span>

              <h2>
                축하합니다,
                <br />
                아무것도 사지 않았습니다
              </h2>

              <p className={styles.lead}>
                장바구니는 비었고 잔고는 그대로입니다. 결제 버튼을 누른 손끝의
                짜릿함만 정확히 챙겼습니다.
              </p>

              <div className={styles.receipt}>
                <div className={styles.receiptHead}>
                  <b>절약 영수증</b>
                  <span>{today}</span>
                </div>

                {/* 장바구니는 이미 비워졌으니 주문 시점에 찍어둔 목록을 쓴다. */}
                {receipt.items.map(({ key, product, qty }) => (
                  <div className={styles.receiptRow} key={key}>
                    <span>
                      {product.name}
                      {qty > 1 ? ` ×${qty}` : ""}
                    </span>
                    <span>안 삼</span>
                  </div>
                ))}

                <div className={styles.receiptRow}>
                  <span>결제수단</span>
                  <span>{receipt.payName}</span>
                </div>

                <div className={styles.receiptRow}>
                  <span>절제 방식</span>
                  <span>{receipt.note}</span>
                </div>

                <div className={styles.receiptTotal}>
                  <span>오늘 아낀 금액</span>
                  <b>{won(receipt.total)}</b>
                </div>
              </div>

              <div className={styles.badges}>
                <span className={styles.badge}>🏅 15일 연속 안 삼</span>
                <span className={styles.badge}>
                  잔고 방어 +{receipt.total.toLocaleString("ko-KR")}
                </span>
                <span className={styles.badge}>{receipt.grade}</span>
              </div>

              <div className={styles.doneCta}>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={goShopping}
                >
                  한 번 더 안 사러 가기
                </button>

                <button
                  type="button"
                  className={styles.ghost}
                  onClick={copyBrag}
                >
                  {shareLabel}
                </button>
              </div>

              <p className={styles.tiny}>
                영수증은 저장되지 않습니다. 아무 일도 일어나지 않았기 때문입니다.
              </p>
            </div>
          </section>
        ) : items.length === 0 ? (
          /* 장바구니가 비었거나 아무것도 선택하지 않고 주소로 바로 들어온 경우 */
          <section className={styles.empty} aria-label="빈 주문서">
            <strong>주문할 상품이 없습니다</strong>
            <p>장바구니에서 담고 선택한 상품만 여기로 올라옵니다.</p>
            <Link className={styles.btn} to="/cart">
              장바구니로 가기
            </Link>
          </section>
        ) : (
          <>
            <nav className={styles.steps} aria-label="주문 단계">
              <div className={styles.step}>
                <b>01</b>담기
              </div>
              <div className={styles.step} aria-current="step">
                <b>02</b>결제
              </div>
              <div className={styles.step}>
                <b>03</b>안 삼
              </div>
            </nav>

            <section className={styles.sec} aria-label="주문 상품">
              <h2>
                주문 상품 <small>{items.length}개 · 실제로는 오지 않음</small>
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
                      {won(product.price * qty)}
                    </div>
                  </article>
                ))}
              </div>

              {/* 이 화면에도 사진이 실리므로 Pexels 출처를 남긴다. (공용 푸터 밖이다) */}
              <p className={styles.credit}>
                상품 이미지 출처:{" "}
                <a
                  href="https://www.pexels.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pexels
                </a>
              </p>
            </section>

            <section className={styles.sec} aria-label="배송지">
              <h2>배송지</h2>

              <div className={styles.cardLine}>
                <div className={styles.addr}>
                  <b>{deliveryName}</b>
                  <span>{deliveryDate}</span>
                  <span>{deliveryRequest}</span>
                </div>

                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => setIsDeliveryModalOpen(true)}
                >
                  배송지 변경
                </button>
              </div>
            </section>

            <section className={styles.sec} aria-label="결제수단">
              <h2>
                결제수단 <small>넷 다 0원입니다</small>
              </h2>

              <div className={styles.pays} role="group" aria-label="결제수단 선택">
                {PAY_METHODS.map((method, index) => (
                  <button
                    key={method.name}
                    type="button"
                    className={styles.pay}
                    aria-pressed={index === payIndex}
                    onClick={() => setPayIndex(index)}
                  >
                    <b>{method.name}</b>
                    <em>{method.desc}</em>
                    {method.recommended && (
                      <span className={styles.rec}>추천</span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section
              className={`${styles.sec} ${styles.slider}`}
              aria-label="절제 포인트"
            >
              <h2>
                절제 포인트 사용 <small>많이 쓸수록 아무 일도 안 일어남</small>
              </h2>

              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={restraint}
                aria-label="절제 포인트 사용 비율"
                onChange={(event) => changeRestraint(Number(event.target.value))}
              />

              <div className={styles.val}>
                <span>{restraintMessage(restraint)}</span>
                <b>{restraint}%</b>
              </div>
            </section>

            <div className={styles.dopa}>
              <div className={styles.dopaTop}>
                <b>도파민 게이지</b>
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

            <section className={styles.sum} aria-label="결제 금액">
              <div className={styles.row}>
                <span>담았던 금액</span>
                <span>{won(total)}</span>
              </div>

              <div className={styles.row}>
                <span>절제 포인트</span>
                <span>−{won(usedPoints)}</span>
              </div>

              <div className={styles.row}>
                <span>
                  안 삼 할인 <small>(나머지 전액)</small>
                </span>
                <span>−{won(total - usedPoints)}</span>
              </div>

              <div className={styles.row}>
                <span>배송비</span>
                <span>0원</span>
              </div>

              <div className={`${styles.row} ${styles.saved}`}>
                <span>오늘 아낀 금액</span>
                <span>{won(total)}</span>
              </div>

              <div className={`${styles.row} ${styles.grand}`}>
                <span>실제 결제금액</span>
                <span>
                  <strong>0원</strong>
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
                  이 사이트는 아무것도 팔지 않으며, 아무것도 배송하지 않는다는
                  사실에 동의합니다. <b>(필수)</b>
                </span>
              </label>

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={agreeThrill}
                  onChange={(event) => setAgreeThrill(event.target.checked)}
                />
                <span>
                  결제 직전의 짜릿함만 챙기고 조용히 창을 닫을 권리가 있음을
                  확인합니다. <b>(필수)</b>
                </span>
              </label>

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={agreeNudge}
                  onChange={(event) => setAgreeNudge(event.target.checked)}
                />
                <span>
                  가끔 "그거 아직 안 샀어요?" 알림을 받겠습니다. (선택)
                </span>
              </label>
            </div>

            <div className={styles.bar}>
              <div className={styles.barRow}>
                <span>
                  {payName} · 절제 {restraint}%
                </span>
                <strong>0원</strong>
              </div>

              <button
                type="button"
                className={`${styles.btn} ${isWobbling ? styles.wob : ""}`}
                onClick={submit}
                onAnimationEnd={() => setIsWobbling(false)}
              >
                0원 결제하기
              </button>

              <button
                type="button"
                className={styles.anyway}
                disabled={isDisabled}
                onClick={() =>
                  setAnywayLabel(
                    "여기서는 살 수 없습니다. 그게 이 사이트의 기능입니다."
                  )
                }
              >
                {anywayLabel}
              </button>

              <p className={styles.tiny}>
                카드 정보는 묻지 않습니다. 물어볼 이유가 없습니다.
              </p>
            </div>

            <section className={styles.brag} aria-label="절제 기록">
              <h2>당신의 절제 기록</h2>

              <div className={styles.stats}>
                {STATS.map(([value, label]) => (
                  <div className={styles.stat} key={label}>
                    <b>{value}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <p className={styles.disclaim}>
              안삼은 실제 상품을 판매하지 않는 가상의 쇼핑몰입니다. 결제, 배송,
              환불, 고객센터, 재고, 택배기사님 모두 존재하지 않습니다. 남는 것은
              기분과 잔고뿐입니다.
            </p>
          </>
        )}
      </div>

      {confetti.length > 0 && (
        <div className={styles.confetti} aria-hidden="true">
          {confetti.map(({ id, ...style }) => (
            <i key={id} style={style} />
          ))}
        </div>
      )}

      {isDeliveryModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsDeliveryModalOpen(false)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="delivery-modal-title">상상 배송지 선택</h2>

              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsDeliveryModalOpen(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className={styles.deliveryList}>
              {DELIVERY_MESSAGES.map(([name], index) => (
                <button
                  type="button"
                  key={name}
                  className={styles.deliveryOption}
                  onClick={() => {
                    setDeliveryIndex(index);
                    setIsDeliveryModalOpen(false);
                  }}
                >
                  <span>{deliveryIndex === index ? "●" : "○"}</span>
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
