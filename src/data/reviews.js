/**
 * 상품별 리뷰. reviews.json은 gzip 기준 470KB라 메인 번들에 넣으면
 * 리뷰를 보지 않는 화면까지 무겁게 만든다. 상세 화면이 열릴 때만 따로 받는다.
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

/* 한 번 받아 두면 상품을 옮겨 다녀도 다시 받지 않는다. */
let loaded = null;
let loading = null;

export async function loadProductReviews(productId) {
  if (!loaded) {
    /* 상세를 빠르게 오가면 여러 번 불리므로 요청 하나를 함께 기다린다. */
    loading = loading ?? import("./reviews.json");
    loaded = (await loading).default;
    loading = null;
  }

  return loaded[productId] ?? EMPTY;
}
