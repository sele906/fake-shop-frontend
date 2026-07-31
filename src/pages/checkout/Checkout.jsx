import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import styles from "./Checkout.module.css";
import { findProduct, productImage, won } from "../../data/products";
import { useCart } from "../../cart/CartProvider";
import { copyText } from "../../lib/clipboard";
import { makeOrderNumber, writeOrder } from "../../order/orderStorage";
import ReceiptCard from "../../receipt/ReceiptCard";
import { receiptUrl } from "../../receipt/receiptLink";
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
  ["0원", "실제 지출"],
  ["0개", "배송 예정"],
  ["무제한", "쿠폰 중복"],
  ["구매 후회", "발생 전 차단"],
];

const RECEIPT_MESSAGES = [
  {
    min: 0,
    note: "절제 0%. 이번 결제는 안 삼 할인이 전액 막았습니다.",
    grade: "절제 훈련 필요",
  },
  {
    min: 20,
    note: "절제 20%. 손가락이 결제 직전에 멈췄습니다.",
    grade: "초보 절제자",
  },
  {
    min: 40,
    note: "절제 40%. 사고 싶은 마음과 제법 비겼습니다.",
    grade: "절제 적응 중",
  },
  {
    min: 60,
    note: "절제 60%. 안 사는 쪽으로 승부가 기울었습니다.",
    grade: "안 삼 우세",
  },
  {
    min: 80,
    note: "절제 80%. 지름신이 퇴근 준비를 시작했습니다.",
    grade: "절제 우등생",
  },
  {
    min: 100,
    note: "절제 100%. 교과서적인 안 삼이 완성됐습니다.",
    grade: "등급 승급 임박",
  },
];

const CONFETTI_COLORS = ["#4b70d3", "#2b4798", "#93a9e6", "#1c1e24", "#dce3f8"];
const CONFETTI_COUNT = 70;
const CONFETTI_MS = 3600;

const SHARE_LABEL = "영수증 자랑하기";
const SHARE_RESET_MS = 2400;

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
  const location = useLocation();
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
  const [shareLabel, setShareLabel] = useState(SHARE_LABEL);

  const confettiTimer = useRef(null);
  const shareTimer = useRef(null);

  const [deliveryIndex, setDeliveryIndex] = useState(0);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  const modalRef = useRef(null);

  const [deliveryName, deliveryDate, deliveryRequest] =
    DELIVERY_MESSAGES[deliveryIndex];

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

  const payName = PAY_METHODS[payIndex].name;
  const usedPoints = Math.round((total * restraint) / 100);

  /* 도파민 게이지는 절제 포인트를 얼마나 썼는지만 그대로 비춘다.
     상태로 두면 다른 곳에서 또 건드리게 되므로 파생값으로 둔다. */
  const dopamine = restraint;

  function changeRestraint(value) {
    setRestraint(value);
    setDopamineMsg(dopamineMessage(value));
  }

  function getReceiptMessage(percent) {
    return [...RECEIPT_MESSAGES]
      .reverse()
      .find(({ min }) => percent >= min);
  }

  function submit() {

    const receiptMessage = getReceiptMessage(restraint);

    if (!agreeService || !agreeThrill) {
      setIsWobbling(true);
      setDopamineMsg(
        "필수 항목에 동의해 주세요. 아무것도 안 사려면 절차는 지켜야 합니다."
      );
      return;
    }

    /* 주문이 끝나면 장바구니를 비우므로, 영수증에 쓸 것은 여기서 찍어둔다.
       상품 데이터를 참조하지 않는 스냅샷이라 그대로 링크에 실을 수 있다. */
    setReceipt({
      date: today,
      total,
      payName,
      note: receiptMessage.note,
      grade: receiptMessage.grade,
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
    const text = `오늘 안삼에서 ${won(receipt.total)} 안 썼습니다.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "안삼 절약 영수증", text, url });
        return;
      } catch (error) {
        /* 공유 시트를 그냥 닫은 것이므로 복사까지 하지는 않는다. */
        if (error.name === "AbortError") return;

        console.error("공유에 실패했습니다.", error);
      }
    }

    const copied = await copyText(url);

    if (copied) {
      setShareLabel("링크를 복사했습니다. 마음껏 자랑하세요");
    } else {
      /* 복사가 막힌 환경에서는 성공한 척하지 않고 링크를 띄워 준다. */
      setShareLabel("복사가 막혀 있습니다");
      toast(url);
    }

    clearTimeout(shareTimer.current);
    shareTimer.current = setTimeout(
      () => setShareLabel(SHARE_LABEL),
      SHARE_RESET_MS
    );
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
                장바구니는 비었고 잔고는 그대로입니다. 
                <br></br>
                결제 버튼을 누른 손끝의 짜릿함만 정확히 챙겼습니다.
              </p>

              {/* 장바구니는 이미 비워졌으니 주문 시점에 찍어둔 스냅샷을 쓴다. */}
              <ReceiptCard receipt={receipt} />

              <div className={styles.doneCta}>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={goShopping}
                >
                  한 번 더 안 사러 가기
                </button>

                <Link className={styles.ghost} to="/delivery">
                  배송 조회하기
                </Link>

                <button
                  type="button"
                  className={styles.ghost}
                  onClick={bragReceipt}
                >
                  {shareLabel}
                </button>
              </div>
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
                /* 채워진 만큼을 CSS가 알아야 해서 값을 변수로 내려준다. */
                style={{ "--fill": `${restraint}%` }}
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
                  장바구니 속 상품과 아름답게 작별하겠습니다. (선택)
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
              안삼은 실제 상품을 판매하지 않는 가상의 쇼핑몰입니다. 
              <br />
              결제, 배송, 환불, 고객센터, 재고, 택배기사님 모두 존재하지 않습니다. 
              <br />
              남는 것은 기분과 잔고뿐입니다.
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
            ref={modalRef}
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
                  aria-pressed={deliveryIndex === index}
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
