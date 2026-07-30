import { findProduct } from "../data/products";

/**
 * 장바구니를 localStorage에 넣고 꺼내는 곳. localStorage를 만지는 코드는 여기뿐이다.
 *
 * 저장 모양:
 *   { version: 1, lines: [{ productId, option, qty, selected }] }
 *
 * 줄에는 참조와 사용자가 고른 것만 담는다. 이름 · 가격 · 이미지를 함께 저장하면
 * products.json을 다시 만들었을 때 장바구니에 옛 정보가 박혀 남는다.
 */
export const CART_KEY = "ansam.cart.v1";
const VERSION = 1;

export const MIN_QTY = 1;
export const MAX_QTY = 10;
export const DEFAULT_OPTION = "단일 옵션";

/* 줄의 정체는 상품 + 옵션이다. 같은 조합을 다시 담으면 수량만 합친다. */
export function lineKey(line) {
  return `${line.productId}::${line.option}`;
}

export function clampQty(qty) {
  const number = Math.round(Number(qty));
  if (!Number.isFinite(number)) return MIN_QTY;

  return Math.min(MAX_QTY, Math.max(MIN_QTY, number));
}

/**
 * 저장된 줄을 화면이 믿고 쓸 수 있는 모양으로 정리한다.
 *
 * - 지금 products.json에 없는 상품은 버린다. id에 pexelsId가 들어 있어서
 *   데이터를 다시 만들면 옛 id가 남을 수 있다.
 * - 손으로 고쳐 넣은 수량 · 옵션도 여기서 조인다.
 * - 같은 상품 + 옵션이 여러 줄로 저장돼 있으면 한 줄로 합친다.
 */
export function normalizeLines(rawLines) {
  if (!Array.isArray(rawLines)) return [];

  const merged = new Map();

  for (const line of rawLines) {
    if (!line || typeof line.productId !== "string") continue;
    if (!findProduct(line.productId)) continue;

    const clean = {
      productId: line.productId,
      option:
        typeof line.option === "string" && line.option.trim()
          ? line.option
          : DEFAULT_OPTION,
      qty: clampQty(line.qty),
      /* 저장된 값이 없으면 선택된 상태로 본다. */
      selected: line.selected !== false,
    };

    const key = lineKey(clean);
    const found = merged.get(key);

    if (found) found.qty = clampQty(found.qty + clean.qty);
    else merged.set(key, clean);
  }

  return [...merged.values()];
}

export function readCart() {
  try {
    const saved = window.localStorage.getItem(CART_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);

    /* 구조가 바뀌면 version을 올린다. 옛 장바구니는 아직 옮길 게 없어 버린다. */
    if (parsed?.version !== VERSION) return [];

    return normalizeLines(parsed.lines);
  } catch (error) {
    /* 값이 깨졌으면 빈 장바구니로 시작한다. */
    console.error("장바구니를 읽지 못했습니다.", error);
    return [];
  }
}

export function writeCart(lines) {
  const payload = JSON.stringify({ version: VERSION, lines });

  try {
    /* 값이 그대로면 쓰지 않는다. 다른 탭에서 받은 변경을 그대로 되쓰면
       storage 이벤트가 서로를 계속 깨우기 때문이다. */
    if (window.localStorage.getItem(CART_KEY) === payload) return;

    window.localStorage.setItem(CART_KEY, payload);
  } catch (error) {
    /* 용량 초과 · 시크릿 모드 등. 저장만 실패하고 화면은 계속 쓸 수 있어야 한다. */
    console.error("장바구니를 저장하지 못했습니다.", error);
  }
}
