import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import HiddenCouponToast from "./HiddenCouponToast";
import {
  announceCoupons,
  normalizeCoupons,
  readCoupons,
  writeCoupons,
} from "./couponStorage";
import { HIDDEN_KEY, readUnlocked, writeUnlocked } from "./hiddenStorage";
import { findHiddenCoupon, getHiddenCoupons } from "../data/coupons";

/**
 * 숨은 업적 쿠폰을 다루는 곳. 미션은 사이트 곳곳(로그인 · 배송 조회 · 헤더 로고
 * 같은 데)에 흩어져 있어서, 각 화면은 "미션을 깼다"고 알리기만 하고 지급 여부는
 * 여기서 정한다.
 *
 *   const { unlock, isUnlocked } = useHiddenCoupon();
 *
 *   const coupon = unlock("hidden-3");
 *   if (coupon) toast(`${coupon.name} 획득!`);   // 처음 깬 경우에만 쿠폰이 온다
 *
 * unlock은 처음 달성했을 때만 쿠폰을 돌려주고, 같은 미션을 반복하면 null이다.
 * 쿠폰함에서 쿠폰을 지운 뒤 다시 깨도 마찬가지다 — 달성 기록은 쿠폰과 따로
 * 남아 있어서(hiddenStorage.js) 두 번 지급되지 않는다.
 */
export default function useHiddenCoupon() {
  /* 첫 렌더에 한 번만 읽는다. */
  const [unlockedIds, setUnlockedIds] = useState(readUnlocked);

  /* 다른 탭에서 미션을 깨면 이 탭도 따라간다. */
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== null && event.key !== HIDDEN_KEY) return;

      setUnlockedIds(readUnlocked());
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds]);

  const isUnlocked = useCallback(
    (missionId) => unlockedSet.has(missionId),
    [unlockedSet]
  );

  /**
   * 미션 달성을 기록하고 쿠폰을 쿠폰함에 넣는다.
   * 처음 깼으면 받은 쿠폰을, 이미 깬 미션이면 null을 돌려준다.
   *
   * 저장된 값을 기준으로 판단한다. 미션은 여러 화면에 흩어져 있어 이 훅의
   * state가 최신이 아닐 수 있고, 미션을 깬 직후 화면을 옮기면 effect가 돌지
   * 못할 수도 있어서 저장까지 여기서 끝낸다.
   */
  const unlock = useCallback((missionId) => {
    const coupon = findHiddenCoupon(missionId);
    /* coupon.json에 없는 미션이면 아무 일도 없었던 걸로 한다. */
    if (!coupon) return null;

    const unlocked = readUnlocked();
    if (unlocked.includes(missionId)) return null;

    const nextUnlocked = [...unlocked, missionId];
    writeUnlocked(nextUnlocked);
    setUnlockedIds(nextUnlocked);

    /* 쿠폰함에 이미 같은 쿠폰이 있으면(손으로 넣었거나 옛 기록) 그대로 둔다. */
    const wallet = readCoupons();

    if (!wallet.some((saved) => saved.id === coupon.id)) {
      writeCoupons(normalizeCoupons([...wallet, coupon]));
      announceCoupons();
    }

    /* 알림도 여기서 띄운다. 미션이 어느 화면에 있든 모양이 같아야 한다.
       기본 토스트보다 오래 두는 건 읽을 내용이 세 줄이기 때문이다. */
    toast(<HiddenCouponToast coupon={coupon} />, {
      duration: 4500,
      style: { background: "var(--accent-700)", padding: "16px" },
    });

    return coupon;
  }, []);

  return {
    hiddenCoupons: getHiddenCoupons(),
    unlockedIds,
    unlockedCount: unlockedIds.length,
    isUnlocked,
    unlock,
  };
}
