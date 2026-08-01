import couponData from "../data/coupon.json";

/**
 * 숨은 업적 쿠폰의 달성 기록을 localStorage에 넣고 꺼내는 곳.
 * 달성 기록을 만지는 코드는 여기뿐이다.
 *
 * 저장 모양:
 *   { version: 1, unlocked: ["hidden-2", "hidden-5"] }
 *
 * 쿠폰함(couponStorage.js)과 나눠 둔다. 쿠폰함은 사용자가 지울 수 있어서
 * 쿠폰이 있는지로만 판단하면, 지운 뒤 같은 미션을 반복해 몇 번이고 다시
 * 받을 수 있기 때문이다. 미션을 깼다는 사실은 쿠폰과 별개로 남긴다.
 */
export const HIDDEN_KEY = "ansam.hidden.v1";
const VERSION = 1;

export const HIDDEN_COUPONS = couponData.filter(
  (coupon) => coupon.group === "hidden"
);

const HIDDEN_IDS = new Set(HIDDEN_COUPONS.map((coupon) => coupon.id));

/**
 * 미션이 걸린 자리에 붙이는 이름. 화면에서 "hidden-6" 같은 문자열을 직접
 * 적으면 어느 미션인지 읽히지 않고, 오타를 내도 조용히 지나간다.
 */
export const MISSION = {
  CART_CODE: "hidden-1",
  LOGO_CLICK: "hidden-2",
  LOGIN_ID: "hidden-3",
  PARTNER_BRAND: "hidden-4",
  DELIVERY_REPLAY: "hidden-5",
  CAREERS_COPY: "hidden-6",
};

export function findHiddenCoupon(id) {
  return HIDDEN_COUPONS.find((coupon) => coupon.id === id) ?? null;
}

/* 지금 coupon.json에 있는 미션만 남긴다. 없어진 미션의 기록은 버린다. */
export function normalizeUnlocked(rawIds) {
  if (!Array.isArray(rawIds)) return [];

  const kept = rawIds.filter(
    (id) => typeof id === "string" && HIDDEN_IDS.has(id)
  );

  return [...new Set(kept)];
}

export function readUnlocked() {
  try {
    const saved = window.localStorage.getItem(HIDDEN_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);

    /* 구조가 바뀌면 version을 올린다. 옛 기록은 아직 옮길 게 없어 버린다. */
    if (parsed?.version !== VERSION) return [];

    return normalizeUnlocked(parsed.unlocked);
  } catch (error) {
    /* 값이 깨졌으면 아무것도 못 깬 상태로 시작한다. */
    console.error("업적 기록을 읽지 못했습니다.", error);
    return [];
  }
}

export function writeUnlocked(ids) {
  const payload = JSON.stringify({ version: VERSION, unlocked: ids });

  try {
    /* 값이 그대로면 쓰지 않는다. 다른 탭에서 받은 변경을 그대로 되쓰면
       storage 이벤트가 서로를 계속 깨우기 때문이다. */
    if (window.localStorage.getItem(HIDDEN_KEY) === payload) return;

    window.localStorage.setItem(HIDDEN_KEY, payload);
  } catch (error) {
    /* 용량 초과 · 시크릿 모드 등. 저장만 실패하고 화면은 계속 쓸 수 있어야 한다. */
    console.error("업적 기록을 저장하지 못했습니다.", error);
  }
}
