import productData from "./products.json";
import { findCategory } from "./categories";

/**
 * 상품 목록. 서버가 없으니 products.json을 그대로 들고 온다.
 *
 * 한 상품의 모양:
 *   { id, brand, name, description, categoryCode, categoryName,
 *     price, listPrice, tag,
 *     image:  { url, alt, pexelsId, searchKeyword },
 *     detail: { title, paragraphs: [...], spec: [{ label, value }] } }
 */
export const PRODUCTS = productData;

/**
 * 목록 정렬 기준. 문구는 화면이 그대로 쓰고, 비교 방식은 sortProducts에만 둔다.
 * 메인과 카테고리가 같은 배열을 보므로 순서와 문구도 자동으로 맞는다.
 */
export const SORTS = [
  /* products.json에 담긴 순서 그대로. 원본 데이터와 대조할 때 쓴다.
     목록은 SORTS[0]으로 시작하므로 이 항목이 기본 정렬이 된다. */
  { key: "none", label: "정렬 없음" },
  { key: "new", label: "방금 나온 척순" },
  { key: "low", label: "통장에 덜 미안한 순" },
  { key: "views", label: "남들이 많이 본 척순" },
];

/* 원본은 건드리지 않고 정렬한 새 배열을 돌려준다. */
export function sortProducts(list, key) {
  switch (key) {
    /* createdAt은 자리수가 고정된 문자열이라 그대로 비교해도 시간순이 된다. */
    case "new":
      return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "low":
      return [...list].sort((a, b) => a.price - b.price);
    /* 조회수는 없으니 fakePopularity를 본 척한다. */
    case "views":
      return [...list].sort((a, b) => b.fakePopularity - a.fakePopularity);
    /* "none"(정렬 없음)과 모르는 키는 받은 순서를 그대로 둔다. */
    default:
      return [...list];
  }
}

export function won(value) {
  return value.toLocaleString("ko-KR") + "원";
}

export function findProduct(id) {
  return PRODUCTS.find((product) => product.id === id);
}

/**
 * 카테고리에 속한 상품. 대분류 코드를 주면 소분류 상품까지 함께 담는다.
 *
 *   productsInCategory("0600")  // 가구·인테리어 전체
 *   productsInCategory("0630")  // 침구만
 */
export function productsInCategory(code) {
  const category = findCategory(code);
  if (!category) return [];

  const codes = new Set([
    category.code,
    ...category.children.map((child) => child.code),
  ]);

  return PRODUCTS.filter((product) => codes.has(product.categoryCode));
}

/* 상세 하단 "함께 보는 상품" — 같은 소분류를 먼저 채우고, 모자라면 같은 대분류에서 가져온다. */
export function relatedProducts(id, count = 4) {
  const product = findProduct(id);
  if (!product) return [];

  const picked = [];
  const seen = new Set([id]);

  function fill(list) {
    for (const item of list) {
      if (picked.length >= count) return;
      if (seen.has(item.id)) continue;

      seen.add(item.id);
      picked.push(item);
    }
  }

  fill(productsInCategory(product.categoryCode));

  const category = findCategory(product.categoryCode);
  if (category?.parentCode) fill(productsInCategory(category.parentCode));

  return picked;
}

/**
 * Pexels 이미지 주소. 크기는 쿼리로 정해지고 원본은 h=350으로 저장돼 있다.
 * 목록 썸네일은 그대로 쓰고, 상세처럼 크게 보여줄 곳만 높이를 올려 요청한다.
 */
export function productImage(image, height) {
  if (!image?.url) return "";
  if (!height) return image.url;

  return image.url.replace(/h=\d+/, `h=${height}`);
}

/* Pexels 방침에 따라 사진이 실린 화면에는 원본 출처를 남긴다. */
export function pexelsPhotoUrl(pexelsId) {
  return `https://www.pexels.com/photo/${pexelsId}/`;
}
