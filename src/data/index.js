import { setProducts } from "./products";
import { setCategories } from "./categories";
import { setCoupons } from "./coupons";

/**
 * 데이터를 가져오는 유일한 입구.
 *
 * 어떤 언어의 어떤 파일을 읽는지 아는 곳은 여기뿐이다. 나중에 데이터를
 * 외부 주소에서 받아오게 되더라도 SOURCES만 고치면 나머지는 그대로다.
 *
 * import()로 적어야 웹팩이 언어별로 청크를 쪼갠다. 경로를 변수로 만들면
 * 두 언어가 한 덩어리로 묶여 안 쓰는 언어까지 받게 되므로 그대로 적어 둔다.
 */
const SOURCES = {
  products: {
    ko: () => import("./ko/products.json"),
    en: () => import("./en/products.json"),
  },
  category: {
    ko: () => import("./ko/category.json"),
    en: () => import("./en/category.json"),
  },
  coupon: {
    ko: () => import("./ko/coupon.json"),
    en: () => import("./en/coupon.json"),
  },
  reviews: {
    ko: () => import("./ko/reviews.json"),
    en: () => import("./en/reviews.json"),
  },
};

/* 지원하지 않는 언어가 들어오면 한국어로 받는다. */
export const DATA_FALLBACK_LANG = "ko";

function pick(name, lang) {
  const source = SOURCES[name];

  return source[lang] ?? source[DATA_FALLBACK_LANG];
}

export function loadData(name, lang) {
  return pick(name, lang)().then((module) => module.default);
}

/**
 * 화면 어디서나 쓰는 데이터. 앱이 그려지기 전에 한 번에 받아 각 모듈에 채운다.
 * 이게 끝나야 findProduct 같은 함수들이 동기로 답할 수 있다.
 *
 * 리뷰는 상세 화면에서만 쓰고 크기도 커서 여기 없다. reviews.js가 같은
 * loadData로 그때 받아온다.
 */
export async function loadCoreData(lang) {
  const [products, categories, coupons] = await Promise.all([
    loadData("products", lang),
    loadData("category", lang),
    loadData("coupon", lang),
  ]);

  setProducts(products);
  setCategories(categories);
  setCoupons(coupons);
}
