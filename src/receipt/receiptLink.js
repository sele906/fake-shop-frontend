/**
 * 영수증을 링크 하나에 담는다. 서버가 없으므로 내용을 전부 주소에 싣는다.
 *
 *   /receipt?d=eyJ2IjoxLCJkIjoiMjAyNi0wNy0zMSIsLi4ufQ
 *
 * 상품 id가 아니라 이름 · 수량 스냅샷을 담기 때문에, products.json을 다시
 * 만들어도 예전에 뿌린 링크가 그대로 살아 있다.
 */
import { shareUrl } from "../lib/shareUrl";

const VERSION = 1;

/* 주소가 지나치게 길어지지 않게 상품 줄은 여기까지만 싣는다. */
export const MAX_LINK_ITEMS = 10;

/* btoa는 라틴1만 받는다. 한글 상품명을 위해 UTF-8로 바꿔서 넣는다. */
function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  const binary = String.fromCharCode(...bytes);

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded) {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

/* 키를 한 글자로 줄여 주소를 짧게 유지한다. */
export function encodeReceipt(receipt) {
  const payload = {
    v: VERSION,
    d: receipt.date,
    t: receipt.total,
    p: receipt.payName,
    m: receipt.note,
    g: receipt.grade,
    n: receipt.itemCount,
    i: receipt.items
      .slice(0, MAX_LINK_ITEMS)
      .map(({ name, qty }) => [name, qty]),
  };

  return toBase64Url(JSON.stringify(payload));
}

/* 주소가 잘리거나 손대진 경우가 흔하므로 실패하면 null을 돌려준다. */
export function decodeReceipt(encoded) {
  if (!encoded) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encoded));
    if (payload?.v !== VERSION || !Array.isArray(payload.i)) return null;

    const items = payload.i
      .filter((row) => Array.isArray(row) && typeof row[0] === "string")
      .map(([name, qty]) => ({ name, qty: Number(qty) || 1 }));

    return {
      date: String(payload.d ?? ""),
      total: Number(payload.t) || 0,
      payName: String(payload.p ?? ""),
      note: String(payload.m ?? ""),
      grade: String(payload.g ?? ""),
      itemCount: Number(payload.n) || items.length,
      items,
    };
  } catch (error) {
    console.error("영수증 링크를 읽지 못했습니다.", error);
    return null;
  }
}

export function receiptUrl(receipt) {
  return shareUrl(`/receipt?d=${encodeReceipt(receipt)}`);
}
