/**
 * 카테고리 트리. 화면이 그려지기 전에 data/index.js가 setCategories로 채운다.
 *
 * 평면 목록을 받아 parentCode를 따라 대분류 → 소분류 트리로 묶고,
 * code로 바로 꺼낼 색인도 함께 만들어 둔다.
 */
let categoryList = [];
let categories = [];
let nodeByCode = new Map();

export function setCategories(list) {
  categoryList = list;

  const nodes = new Map(
    list.map((category) => [category.code, { ...category, children: [] }])
  );

  const roots = [];

  for (const node of nodes.values()) {
    const parent = node.parentCode ? nodes.get(node.parentCode) : null;

    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  categories = roots;

  /* 트리를 만든 뒤 색인을 새로 짠다. 대분류·소분류를 모두 담는다. */
  nodeByCode = new Map();

  (function indexNodes(nodeList) {
    for (const node of nodeList) {
      nodeByCode.set(node.code, node);
      indexNodes(node.children);
    }
  })(categories);
}

/* category.json 평면 목록 그대로. 검색·셀렉트박스처럼 계층이 필요 없을 때 쓴다. */
export function getCategoryList() {
  return categoryList;
}

/**
 * 사이드바가 기대하는 트리. 하위가 없는 대분류도 children: []을 갖는다.
 * JSON이 code 순으로 정렬돼 있어 결과 순서도 code 순이다.
 */
export function getCategories() {
  return categories;
}

/* 없는 코드면 null. children이 붙은 트리 노드를 돌려준다. */
export function findCategory(code) {
  return nodeByCode.get(code) ?? null;
}

/* 브레드크럼용. "0110" → [패션, 여성의류] 순서로 조상을 모두 담는다. */
export function getCategoryPath(code) {
  const path = [];
  let node = findCategory(code);

  while (node) {
    path.unshift(node);
    node = node.parentCode ? findCategory(node.parentCode) : null;
  }

  return path;
}

/* 상품 목록 헤더처럼 이름만 필요할 때. 없는 코드는 빈 문자열이다. */
export function getCategoryName(code) {
  return findCategory(code)?.name ?? "";
}
