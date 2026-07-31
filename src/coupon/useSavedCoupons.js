import { useCallback, useEffect, useState } from "react";
import { COUPON_KEY, readCoupons, writeCoupons } from "./couponStorage";

/**
 * localStorage에 저장된 쿠폰함을 읽고 쓴다. 쿠폰 보관함과 장바구니가 같은 값을
 * 봐야 해서 훅으로 뺐다.
 *
 *   const [coupons, setCoupons, removeCoupons] = useSavedCoupons();
 */
export default function useSavedCoupons() {
  /* 첫 렌더에 한 번만 읽는다. */
  const [coupons, setCoupons] = useState(readCoupons);

  useEffect(() => {
    writeCoupons(coupons);
  }, [coupons]);

  /* 다른 탭에서 쿠폰함이 바뀌면 이 탭도 따라간다.
     storage 이벤트는 값을 바꾼 탭에는 오지 않으므로 서로 한 번씩만 맞춰진다. */
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== null && event.key !== COUPON_KEY) return;

      setCoupons(readCoupons());
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  /**
   * 쓴 쿠폰을 쿠폰함에서 없앤다.
   *
   * 저장을 useEffect에 맡기지 않고 여기서 끝낸다. 주문하기처럼 쿠폰을 쓴 직후
   * 다른 화면으로 넘어가면 이 컴포넌트가 그대로 사라져 effect가 돌지 않을 수
   * 있기 때문이다.
   */
  const removeCoupons = useCallback((ids) => {
    const used = new Set(ids);
    const left = readCoupons().filter((coupon) => !used.has(coupon.id));

    writeCoupons(left);
    setCoupons(left);
  }, []);

  return [coupons, setCoupons, removeCoupons];
}
