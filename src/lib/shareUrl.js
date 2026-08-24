/**
 * 밖으로 내보내는 주소는 여기서만 만든다.
 *
 * `window.location`을 쓰면 앱에서 깨진다. Capacitor는 build/를 기기 안에서
 * `https://localhost`로 서빙하므로 — capacitor.config.json에 server 키가 없을
 * 때의 기본값이다 — 앱 웹뷰의 origin이 진짜로 `https://localhost`다. 웹을
 * 배포해도 이 값은 안 바뀐다. 링크를 받은 사람에게는 열리지 않는 주소가 간다.
 *
 * 그래서 공개 주소를 빌드에 박아 둔다. 미리보기 배포에서 공유해도 링크는
 * 운영 주소를 가리키는데, 이쪽이 맞다 — 미리보기 주소는 곧 사라진다.
 */
export const SITE_ORIGIN = "https://fake-shop-frontend-ivory.vercel.app";

/** `/receipt?d=...` 같은 절대 경로를 공유 가능한 주소로 만든다. */
export function shareUrl(path) {
  return new URL(path, SITE_ORIGIN).toString();
}

/** 지금 보고 있는 화면의 공유 주소. 해시는 공유할 내용이 아니라 뺀다. */
export function currentShareUrl() {
  return shareUrl(window.location.pathname + window.location.search);
}
