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
