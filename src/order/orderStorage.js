/**
 * 방금 "결제한 척"한 주문을 localStorage에 넣고 꺼내는 곳.
 * 주문 저장소를 만지는 코드는 여기뿐이다.
 *
 * 저장 모양:
 *   {
 *     version: 1,
 *     order: {
 *       orderNumber, orderedAt, payName, total,
 *       items: [{ productId, name, brand, option, qty, price }]
 *     }
 *   }
 *
 * 주문서(Checkout)가 쓰고 배송 조회(Delivery)가 읽는다. 한 건만 들고 있으면
 * 되므로 배열이 아니라 마지막 주문 하나만 남긴다.
 *
 * 줄에 이름 · 가격을 함께 저장하는 것은 주문이 끝나면 장바구니가 비기 때문이다.
 * 사진처럼 무거운 것은 productId로 그때그때 찾는다.
 */
export const ORDER_KEY = "ansam.order.v1";
const VERSION = 1;

/** 주문번호. 날짜 + 네 자리면 진짜처럼 보이기에 충분하다. */
export function makeOrderNumber(date = new Date()) {
  const day = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" })
    .format(date)
    .replaceAll("-", "");
  const serial = String(Math.floor(Math.random() * 10000)).padStart(4, "0");

  return `ANSAM-${day}-${serial}`;
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function toItem(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.name !== "string" || !raw.name) return null;

  return {
    productId: typeof raw.productId === "string" ? raw.productId : "",
    name: raw.name,
    brand: typeof raw.brand === "string" ? raw.brand : "",
    option: typeof raw.option === "string" ? raw.option : "",
    qty: Math.max(1, Math.round(toNumber(raw.qty)) || 1),
    price: Math.max(0, Math.round(toNumber(raw.price))),
  };
}

/** 저장된 주문을 화면이 믿고 쓸 수 있는 모양으로 정리한다. 아니면 null. */
export function normalizeOrder(raw) {
  if (!raw || typeof raw !== "object") return null;

  const items = Array.isArray(raw.items)
    ? raw.items.map(toItem).filter(Boolean)
    : [];

  /* 상품이 한 줄도 없는 주문은 배송할 것도 없다. */
  if (items.length === 0) return null;

  return {
    orderNumber:
      typeof raw.orderNumber === "string" && raw.orderNumber
        ? raw.orderNumber
        : makeOrderNumber(),
    orderedAt: typeof raw.orderedAt === "string" ? raw.orderedAt : "",
    payName: typeof raw.payName === "string" ? raw.payName : "",
    total: Math.max(0, Math.round(toNumber(raw.total))),
    items,
  };
}

export function readOrder() {
  try {
    const saved = window.localStorage.getItem(ORDER_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);

    /* 구조가 바뀌면 version을 올린다. 옛 주문은 아직 옮길 게 없어 버린다. */
    if (parsed?.version !== VERSION) return null;

    return normalizeOrder(parsed.order);
  } catch (error) {
    /* 값이 깨졌으면 주문이 없는 것으로 본다. */
    console.error("주문 정보를 읽지 못했습니다.", error);
    return null;
  }
}

export function writeOrder(order) {
  try {
    window.localStorage.setItem(
      ORDER_KEY,
      JSON.stringify({ version: VERSION, order })
    );
  } catch (error) {
    /* 용량 초과 · 시크릿 모드 등. 저장만 실패하고 화면은 계속 쓸 수 있어야 한다. */
    console.error("주문 정보를 저장하지 못했습니다.", error);
  }
}

/** 배송이 끝나면 지운다. 배송이 끝난 주문을 계속 추적할 이유가 없다. */
export function clearOrder() {
  try {
    window.localStorage.removeItem(ORDER_KEY);
  } catch (error) {
    console.error("주문 정보를 지우지 못했습니다.", error);
  }
}
