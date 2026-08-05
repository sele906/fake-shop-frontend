import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/**
 * 금액을 지금 언어의 표기로 그린다.
 *
 *   const price = usePrice();
 *   price(37800)   // ko: "37,800원"   en: "37,800 KRW"
 *
 * 자릿수 구분과 단위 위치가 언어마다 달라서 숫자 서식은 Intl에,
 * 단위를 붙이는 모양은 common.json의 price에 맡긴다.
 */
export default function usePrice() {
  const { t } = useTranslation("common");

  return useCallback(
    (value) => t("price", { amount: value.toLocaleString(t("intlLocale")) }),
    [t]
  );
}
