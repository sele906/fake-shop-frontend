import { findCategory } from "./categories";

/**
 * 상품 목록. 화면이 그려지기 전에 data/index.js가 setProducts로 채워 넣는다.
 * 그 뒤로는 아래 함수들이 전부 동기로 답한다.
 *
 * 한 상품의 모양:
 *   { id, brand, name, description, categoryCode, categoryName,
 *     price, listPrice, tag,
 *     image:  { url, alt, pexelsId, searchKeyword },
 *     detail: { title, paragraphs: [...], spec: [{ label, value }] } }
 */
let products = [];

export function setProducts(list) {
  products = list;
}

export function getProducts() {
  return products;
}

/**
 * 목록 정렬 기준. 비교 방식은 sortProducts에만 둔다.
 * 메인과 카테고리가 같은 배열을 보므로 순서가 자동으로 맞는다.
 *
 * 화면에 보일 이름은 데이터가 아니라 문구라서 common.json의 sort가 들고 있다.
 * 목록을 그리는 쪽에서 useSortOptions로 키와 이름을 붙여 쓴다.
 */
export const SORT_KEYS = ["new", "low", "views"];

/**
 * 스펙에서 사이즈 항목을 찾을 때 쓰는 이름.
 *
 * products.json에 든 항목 이름이라 언어를 탄다. 화면 문구가 아니어서
 * locales가 아니라 데이터를 아는 이 파일에 둔다. 두 언어 모두 이 이름이
 * 정확히 붙은 상품이 325개로 같다.
 */
const SIZE_SPEC_LABEL = { ko: "사이즈", en: "Size" };

/* 사이즈 칩에 쓸 목록. 해당 스펙이 없는 상품은 빈 배열이다. */
export function sizeOptions(product, lang) {
  const label = SIZE_SPEC_LABEL[lang] ?? SIZE_SPEC_LABEL.ko;
  const row = product?.detail?.spec?.find((item) => item.label === label);

  if (!row) return [];

  return row.value
    .split("/")
    .map((size) => size.trim())
    .filter(Boolean);
}

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
    /* 모르는 키는 받은 순서를 그대로 둔다. */
    default:
      return [...list];
  }
}

export function findProduct(id) {
  return products.find((product) => product.id === id);
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

  return products.filter((product) => codes.has(product.categoryCode));
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
