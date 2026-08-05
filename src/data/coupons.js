/**
 * 쿠폰 원본. 화면이 그려지기 전에 data/index.js가 setCoupons로 채운다.
 *
 * 한 장의 모양:
 *   { id, group, name, benefit, description }
 *
 * 받은 쿠폰을 localStorage에 넣고 꺼내는 일은 coupon/couponStorage.js가,
 * 숨은 쿠폰의 달성 기록은 coupon/hiddenStorage.js가 맡는다. 여기는 원본만 든다.
 */
let coupons = [];

export function setCoupons(list) {
  coupons = list;
}

export function getCoupons() {
  return coupons;
}

/* 목록에 깔리는 쿠폰. 숨은 쿠폰은 미션을 깨야 나오므로 여기서 뺀다. */
export function getVisibleCoupons() {
  return coupons.filter((coupon) => coupon.group !== "hidden");
}

export function getHiddenCoupons() {
  return coupons.filter((coupon) => coupon.group === "hidden");
}

export function findHiddenCoupon(id) {
  return getHiddenCoupons().find((coupon) => coupon.id === id) ?? null;
}
