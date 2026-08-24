import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

import { SITE_ORIGIN } from "../lib/shareUrl";

/**
 * 공유 링크를 눌러 앱이 열렸을 때 그 화면으로 옮긴다.
 *
 * 매니페스트의 intent-filter는 "이 앱이 이 주소를 받는다"까지만 정한다.
 * 실제로 열리는 것은 늘 `https://localhost/` — Capacitor가 기기 안에서
 * 서빙하는 첫 화면이다. 눌린 주소는 인텐트에 따로 실려 오므로 여기서 꺼내
 * 라우터에게 넘겨야 한다. 이게 없으면 링크를 눌러도 홈이 뜬다.
 *
 * 들어오는 길이 둘이라 양쪽을 다 받는다.
 *
 *   - 앱이 꺼져 있었으면 인텐트가 액티비티를 만들며 들어온다 → getLaunchUrl
 *   - 이미 떠 있었으면 onNewIntent로 들어온다 → appUrlOpen
 *
 * launchMode가 singleTask라 두 번째 경우에 앱이 새로 뜨지 않는다.
 *
 * 뒤로가기는 밀어 넣는다(replace 아님). 링크로 들어온 사람이 뒤로가기를
 * 눌렀을 때 앱이 꺼지는 것보다 홈으로 가는 쪽이 낫다 — useBackButton은
 * 첫 화면(idx 0)에서 두 번 눌러야 나가게 되어 있다.
 */
export default function useDeepLink() {
  const navigate = useNavigate();

  /**
   * 이펙트는 마운트 때 한 번만 돈다. navigate를 의존성에 넣으면 안 된다 —
   * react-router의 navigate는 현재 경로를 클로저에 담아서 화면을 옮길 때마다
   * 정체가 바뀌고, 그러면 이펙트가 다시 돌면서 getLaunchUrl을 또 부른다.
   * 그 값은 앱을 처음 연 주소라, 방금 옮긴 화면이 첫 화면으로 되돌아간다.
   */
  const navigateRef = useRef(navigate);

  navigateRef.current = navigate;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    function open(url) {
      if (!url) return;

      let target;

      try {
        target = new URL(url);
      } catch (error) {
        console.error("링크를 읽지 못했습니다.", error);
        return;
      }

      /* 우리 주소가 아니면 건드리지 않는다. 필터가 좁아도 인텐트는
         누구나 만들어 보낼 수 있어서, 받는 쪽에서도 한 번 본다. */
      if (target.origin !== SITE_ORIGIN) return;

      navigateRef.current(target.pathname + target.search);
    }

    /* 꺼져 있다 열린 경우에 한해 같은 주소가 두 경로로 겹칠 수 있다.
       한 번만 무시하므로, 앱을 켜 둔 채 같은 링크를 또 눌러도 동작한다. */
    let launched = null;

    /* 링크가 아니라 런처 아이콘으로 켜면 인텐트에 URI가 없고, 그때
       getLaunchUrl은 빈 객체가 아니라 아무 값 없이 resolve한다
       (AppPlugin.java의 call.resolve(), 타입도 AppLaunchUrl | undefined).
       바로 분해하면 평범한 실행마다 터진다. */
    App.getLaunchUrl().then((launch) => {
      launched = launch?.url ?? null;
      open(launched);
    });

    const handle = App.addListener("appUrlOpen", ({ url }) => {
      if (url && url === launched) {
        launched = null;
        return;
      }

      open(url);
    });

    /* addListener는 프라미스를 준다. 정리할 때 그 안의 handle을 써야 한다. */
    return () => {
      handle.then((listener) => listener.remove());
    };
  }, []);
}
