import { loadData } from "./index";

/**
 * 상품별 리뷰. 언어당 gzip 600KB 남짓이라 앱 시작 때 받지 않고
 * 상세 화면이 열릴 때만 따로 받는다. 받는 방법은 다른 데이터와 같은 loadData다.
 *
 * 한 상품의 모양:
 *   { averageRating, reviewCount,
 *     ratingDistribution: { "1": n, ... "5": n },
 *     reviews: [{ id, rating, writer, date, text }] }
 */
const EMPTY = {
  averageRating: 0,
  reviewCount: 0,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  reviews: [],
};

/* 한 번 받아 두면 상품을 옮겨 다녀도 다시 받지 않는다.
   언어를 바꾸면 다른 파일이므로 어느 언어를 들고 있는지 함께 기억한다. */
let cache = { lang: null, data: null };
let pending = null;

export async function loadProductReviews(productId, lang) {
  if (cache.lang !== lang) {
    /* 상세를 빠르게 오가면 여러 번 불리므로 요청 하나를 함께 기다린다. */
    if (pending?.lang !== lang) {
      pending = { lang, promise: loadData("reviews", lang) };
    }

    const data = await pending.promise;

    cache = { lang, data };
    pending = null;
  }

  return cache.data[productId] ?? EMPTY;
}
