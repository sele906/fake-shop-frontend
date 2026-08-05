import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCareers from "./locales/en/careers.json";
import enCart from "./locales/en/cart.json";
import enCheckout from "./locales/en/checkout.json";
import enCommon from "./locales/en/common.json";
import enCompany from "./locales/en/company.json";
import enCoupon from "./locales/en/coupon.json";
import enCtg from "./locales/en/ctg.json";
import enDelivery from "./locales/en/delivery.json";
import enDetail from "./locales/en/detail.json";
import enHelp from "./locales/en/help.json";
import enLayout from "./locales/en/layout.json";
import enLogin from "./locales/en/login.json";
import enMain from "./locales/en/main.json";
import enPromo from "./locales/en/promo.json";
import enReceipt from "./locales/en/receipt.json";

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
export const LANGUAGES = ["ko", "en"];
export const STORAGE_KEY = "ansam.lang.v1";

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
  en: {
    careers: enCareers,
    cart: enCart,
    checkout: enCheckout,
    common: enCommon,
    company: enCompany,
    coupon: enCoupon,
    ctg: enCtg,
    delivery: enDelivery,
    detail: enDetail,
    help: enHelp,
    layout: enLayout,
    login: enLogin,
    main: enMain,
    promo: enPromo,
    receipt: enReceipt,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: LANGUAGES,
    /* 브라우저가 "en-US"·"ko-KR"처럼 지역까지 붙여 보내므로 앞부분만 본다.
       이게 없으면 영어권 브라우저가 supportedLngs에 걸려 한국어로 열린다. */
    load: "languageOnly",
    fallbackLng: "ko",
    defaultNS: "common",

    detection: {
      /* 고른 언어를 먼저 본다. 고른 적이 없으면 브라우저 설정을 따라가고,
         그것도 한국어·영어가 아니면 fallbackLng인 한국어로 연다.
         저장은 이 앱의 다른 키들과 같은 ansam.* 규칙을 쓴다. */
      order: ["localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },

    interpolation: {
      /* 리액트가 이미 XSS를 막아 준다. 여기서 또 이스케이프하면 따옴표가 깨진다. */
      escapeValue: false,
    },
  });

export default i18n;
