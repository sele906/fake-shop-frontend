/**
 * 받은 쿠폰을 localStorage에 넣고 꺼내는 곳. 쿠폰 저장소를 만지는 코드는 여기뿐이다.
 *
 * 저장 모양:
 *   { version: 1, coupons: [{ id, group, name, benefit, description }] }
 *
 * 장바구니는 id만 저장하지만(cartStorage.js) 쿠폰은 한 장을 통째로 저장한다.
 * 저장된 값을 그대로 꺼내 coupon.json에 붙여 넣을 수 있어야 하기 때문이다.
 * 그래서 화면에서 덧붙인 값(type · value 같은 것)은 여기서 전부 털어낸다.
 */
export const COUPON_KEY = "ansam.coupons.v1";
const VERSION = 1;

/* 손으로 고쳐 넣은 쿠폰에 group이 없을 수도 있다. */
export const UNKNOWN_GROUP = "unknown";

/** coupon.json 한 줄의 모양으로 깎는다. 모양이 아니면 null. */
function toCoupon(raw) {
  if (!raw || typeof raw !== "object") return null;
  /* 이름과 혜택이 없으면 화면에 그릴 것이 없다. */
  if (typeof raw.id !== "string" || !raw.id) return null;
  if (typeof raw.name !== "string" || !raw.name) return null;
  if (typeof raw.benefit !== "string" || !raw.benefit) return null;

  return {
    id: raw.id,
    group: typeof raw.group === "string" && raw.group ? raw.group : UNKNOWN_GROUP,
    name: raw.name,
    benefit: raw.benefit,
    description: typeof raw.description === "string" ? raw.description : "",
  };
}

/**
 * 저장된 쿠폰을 화면이 믿고 쓸 수 있는 모양으로 정리한다.
 *
 * - 모양이 깨진 줄은 버린다.
 * - 같은 쿠폰을 두 번 받아도 한 장이다. 먼저 받은 쪽을 남긴다.
 * - coupon.json에 없는 id도 남긴다. 저장된 값에 쿠폰 내용이 다 들어 있어서
 *   원본이 바뀌어도 읽을 수 있고, 사용자가 만든 쿠폰도 그대로 살아남는다.
 */
export function normalizeCoupons(rawCoupons) {
  if (!Array.isArray(rawCoupons)) return [];

  const merged = new Map();

  for (const raw of rawCoupons) {
    const coupon = toCoupon(raw);

    if (!coupon) continue;
    if (merged.has(coupon.id)) continue;

    merged.set(coupon.id, coupon);
  }

  return [...merged.values()];
}

export function readCoupons() {
  try {
    const saved = window.localStorage.getItem(COUPON_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);

    /* 구조가 바뀌면 version을 올린다. 옛 쿠폰함은 아직 옮길 게 없어 버린다. */
    if (parsed?.version !== VERSION) return [];

    return normalizeCoupons(parsed.coupons);
  } catch (error) {
    /* 값이 깨졌으면 빈 쿠폰함으로 시작한다. */
    console.error("쿠폰함을 읽지 못했습니다.", error);
    return [];
  }
}

export function writeCoupons(coupons) {
  const payload = JSON.stringify({ version: VERSION, coupons });

  try {
    /* 값이 그대로면 쓰지 않는다. 다른 탭에서 받은 변경을 그대로 되쓰면
       storage 이벤트가 서로를 계속 깨우기 때문이다. */
    if (window.localStorage.getItem(COUPON_KEY) === payload) return;

    window.localStorage.setItem(COUPON_KEY, payload);
  } catch (error) {
    /* 용량 초과 · 시크릿 모드 등. 저장만 실패하고 화면은 계속 쓸 수 있어야 한다. */
    console.error("쿠폰함을 저장하지 못했습니다.", error);
  }
}

/** 내보내기 · 화면 미리보기용. coupon.json과 같은 배열 모양으로 뽑는다. */
export function toCouponJson(coupons) {
  return JSON.stringify(coupons, null, 2);
}

/**
 * benefit은 "7%"나 "30,000원" 같은 문구다. 계산에 쓸 수 있게 숫자로 읽는다.
 * %로 끝나면 비율, 아니면 원 단위로 본다.
 */
export function readBenefit(coupon) {
  const benefit = String(coupon?.benefit ?? "").trim();
  const value = Number(benefit.replace(/[^0-9]/g, ""));

  return {
    type: benefit.endsWith("%") ? "percent" : "fixed",
    value: Number.isFinite(value) ? value : 0,
  };
}

/** 선택된 쿠폰이 상품 금액에서 깎아내는 액수. */
export function couponDiscount(coupons, itemTotal) {
  const total = coupons.reduce((sum, coupon) => {
    const { type, value } = readBenefit(coupon);

    return sum + (type === "percent" ? itemTotal * (value / 100) : value);
  }, 0);

  return Math.round(total);
}
