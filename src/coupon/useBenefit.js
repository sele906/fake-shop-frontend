import { useCallback } from "react";
import usePrice from "../lib/usePrice";
import { readBenefit } from "./couponStorage";

/**
 * 쿠폰 혜택을 지금 언어의 통화로 그린다.
 *
 *   const benefit = useBenefit();
 *   benefit(coupon)   // "5,000원" → ko: "5,000원"   en: "$3.57"
 *                     // "7%"      → 그대로
 *
 * 저장된 benefit 문구는 받은 시점의 언어로 찍혀 있어("5,000원" · "₩5,000")
 * 그대로 그리면 언어가 섞인다. 문구는 원 단위 원본으로 두고 여기서만 바꾼다 —
 * 원본을 "$3.57"로 고치면 readBenefit이 357원으로 읽는다.
 */
export default function useBenefit() {
  const price = usePrice();

  return useCallback(
    (coupon) => {
      const { type, value } = readBenefit(coupon);

      return type === "percent" ? coupon.benefit : price(value);
    },
    [price]
  );
}
