import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SORT_KEYS } from "../data/products";

/**
 * 정렬 탭 · 드롭다운이 쓰는 [{ key, label }] 목록.
 *
 * 순서는 products.js의 SORT_KEYS가, 이름은 common.json의 sort가 정한다.
 * 목록은 SORT_KEYS[0]으로 시작하므로 그 항목이 기본 정렬이 된다.
 */
export default function useSortOptions() {
  const { t } = useTranslation("common");

  return useMemo(
    () => SORT_KEYS.map((key) => ({ key, label: t(`sort.${key}`) })),
    [t]
  );
}
