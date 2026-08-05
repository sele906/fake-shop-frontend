import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import koCareers from "./locales/ko/careers.json";
import koCart from "./locales/ko/cart.json";
import koCheckout from "./locales/ko/checkout.json";
import koCommon from "./locales/ko/common.json";
import koCompany from "./locales/ko/company.json";
import koCoupon from "./locales/ko/coupon.json";
import koCtg from "./locales/ko/ctg.json";
import koDelivery from "./locales/ko/delivery.json";
import koDetail from "./locales/ko/detail.json";
import koHelp from "./locales/ko/help.json";
import koLayout from "./locales/ko/layout.json";
import koLogin from "./locales/ko/login.json";
import koMain from "./locales/ko/main.json";
import koPromo from "./locales/ko/promo.json";
import koReceipt from "./locales/ko/receipt.json";

/**
 * 화면 문구는 전부 locales 아래에 있고, 컴포넌트는 키만 부른다.
 *
 *   const { t } = useTranslation("cart");
 *   t("empty.title")                     // cart.json의 empty.title
 *   t("common:brand.name")               // 다른 네임스페이스는 앞에 붙여서 부른다
 *
 * 파일 하나가 네임스페이스 하나다. 언어가 2개, 문구가 900개 남짓이라
 * 지연 로딩 없이 번들에 그대로 싣는다. 나중에 언어가 늘면
 * i18next-http-backend로 바꾸면 되고, 폴더 구조는 이미 그 규칙을 따르고 있다.
 */
export const resources = {
  ko: {
    careers: koCareers,
    cart: koCart,
    checkout: koCheckout,
    common: koCommon,
    company: koCompany,
    coupon: koCoupon,
    ctg: koCtg,
    delivery: koDelivery,
    detail: koDetail,
    help: koHelp,
    layout: koLayout,
    login: koLogin,
    main: koMain,
    promo: koPromo,
    receipt: koReceipt,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ko",
  fallbackLng: "ko",
  defaultNS: "common",
  interpolation: {
    /* 리액트가 이미 XSS를 막아 준다. 여기서 또 이스케이프하면 따옴표가 깨진다. */
    escapeValue: false,
  },
});

export default i18n;
