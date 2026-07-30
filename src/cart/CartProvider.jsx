import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { findProduct } from "../data/products";
import {
  CART_KEY,
  DEFAULT_OPTION,
  MAX_QTY,
  clampQty,
  lineKey,
  readCart,
  writeCart,
} from "./cartStorage";

const CartContext = createContext(null);

/**
 * 장바구니 상태. 상세 · 장바구니 · 주문서가 레이아웃 라우트 밖이라
 * App.js에서 라우터 전체를 감싸 쓴다.
 *
 *   const { items, count, addItem } = useCart();
 */
export function useCart() {
  return useContext(CartContext);
}

export default function CartProvider({ children }) {
  /* 첫 렌더에 한 번만 읽는다. */
  const [lines, setLines] = useState(readCart);

  useEffect(() => {
    writeCart(lines);
  }, [lines]);

  /* 다른 탭에서 장바구니가 바뀌면 이 탭도 따라간다.
     storage 이벤트는 값을 바꾼 탭에는 오지 않으므로 서로 한 번씩만 맞춰진다. */
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== null && event.key !== CART_KEY) return;

      setLines(readCart());
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  /* 줄 + 상품을 합쳐 화면이 쓸 모양으로 만든다.
     상품 정보는 products.js가 정답이라 매번 여기서 붙인다. */
  const items = useMemo(
    () =>
      lines
        .map((line) => ({
          ...line,
          key: lineKey(line),
          product: findProduct(line.productId),
        }))
        .filter((item) => item.product),
    [lines]
  );

  /* 같은 상품 + 같은 옵션이면 새 줄이 아니라 수량을 더한다. */
  const addItem = useCallback((product, options = {}) => {
    const { option = DEFAULT_OPTION, qty = 1 } = options;
    const key = `${product.id}::${option}`;

    setLines((current) => {
      const exists = current.some((line) => lineKey(line) === key);

      if (exists) {
        return current.map((line) =>
          lineKey(line) === key
            ? { ...line, qty: clampQty(line.qty + qty), selected: true }
            : line
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          option,
          qty: clampQty(qty),
          selected: true,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key) => {
    setLines((current) => current.filter((line) => lineKey(line) !== key));
  }, []);

  const removeSelected = useCallback(() => {
    setLines((current) => current.filter((line) => !line.selected));
  }, []);

  const changeQty = useCallback((key, delta) => {
    setLines((current) =>
      current.map((line) =>
        lineKey(line) === key
          ? { ...line, qty: clampQty(line.qty + delta) }
          : line
      )
    );
  }, []);

  const toggleSelected = useCallback((key, selected) => {
    setLines((current) =>
      current.map((line) =>
        lineKey(line) === key ? { ...line, selected } : line
      )
    );
  }, []);

  const selectAll = useCallback((selected) => {
    setLines((current) =>
      current.map((line) => {
        /* 품절 상품은 애초에 선택할 수 없으니 전체선택에서도 건너뛴다.
           (지금은 재고 정보가 없어 해당되는 줄이 없다.) */
        const product = findProduct(line.productId);

        return product?.soldOut ? line : { ...line, selected };
      })
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({
      items,
      /* 헤더 배지 — 수량 합이 아니라 담은 줄 수다. */
      count: items.length,
      maxQty: MAX_QTY,
      addItem,
      removeItem,
      removeSelected,
      changeQty,
      toggleSelected,
      selectAll,
      clear,
    }),
    [
      items,
      addItem,
      removeItem,
      removeSelected,
      changeQty,
      toggleSelected,
      selectAll,
      clear,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
