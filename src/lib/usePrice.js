import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * 1 단위가 몇 원인가. 표시용 고정값이다.
 *
 * 실시간 환율을 받지 않는다. 밖으로 나가는 연결이 늘면 개인정보 처리방침을
 * 고쳐야 하고, 오프라인에서 금액이 사라지고, 같은 영수증 링크의 금액이 날마다
 * 달라진다. 살 수 없는 가게라 정확할 필요도 없다.
 */
const WON_PER_UNIT = {
  KRW: 1,
  USD: 1400,
};

/**
 * 금액을 지금 언어의 통화로 그린다. 받는 값은 언제나 원이다.
 *
 *   const price = usePrice();
 *   price(37800)          // ko: "37,800원"   en: "$27.00"
 *   price.amount(37800)   // ko: "37,800"     en: "27.00"   (단위 없이)
 *
 * 합산 · 할인 계산은 원 정수로 끝낸 뒤 여기서 한 번만 바꾼다. 줄마다 달러로
 * 바꿔 더하면 반올림이 쌓여 합계가 1센트씩 어긋난다.
 *
 * 통화는 common.json의 currency, 단위를 붙이는 모양은 price, 자릿수 구분은
 * intlLocale이 정한다. 소수 자릿수는 Intl이 통화마다 알고 있다(KRW 0 · USD 2).
 */
export default function usePrice() {
  const { t } = useTranslation("common");

  const amount = useCallback(
    (won) => {
      const locale = t("intlLocale");
      const currency = t("currency");
      const rate = WON_PER_UNIT[currency] ?? 1;
      const digits = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).resolvedOptions().maximumFractionDigits;

      return (won / rate).toLocaleString(locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    },
    [t]
  );

  return useMemo(
    () =>
      Object.assign((won) => t("price", { amount: amount(won) }), { amount }),
    [t, amount]
  );
}
