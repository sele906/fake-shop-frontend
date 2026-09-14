package com.ansam.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;

import androidx.appcompat.app.AppCompatDelegate;
import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {

    /* 페이지가 끝내 안 뜨더라도 로고 화면에 갇히지 않게 하는 상한. */
    private static final long SPLASH_MAX_MS = 3000;

    private static final long SPLASH_FADE_MS = 400;

    private volatile boolean webReady = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        /* 플러그인 등록과 나이트 모드는 둘 다 super.onCreate 앞이어야 한다.
           super가 테마를 적용하고 화면을 만들기 때문에, 그 뒤에 모드를 바꾸면
           첫 프레임이 옛 색으로 한 번 그려진다. */
        registerPlugin(ThemePlugin.class);

        AppCompatDelegate.setDefaultNightMode(
                ThemeStore.toDelegateMode(ThemeStore.load(this)));

        /* installSplashScreen도 super.onCreate 앞이다. 테마를 launch에서
           postSplashScreenTheme로 바꾸는 일을 여기서 한다. */
        SplashScreen splash = SplashScreen.installSplashScreen(this);

        super.onCreate(savedInstanceState);

        keepSplashUntilWebReady(splash);
    }

    /**
     * 로고를 웹 화면이 뜰 때까지 붙잡아 두었다가 서서히 걷는다.
     *
     * 기본값은 액티비티의 첫 프레임에서 걷히는데, 그 순간 웹뷰는 아직 빈
     * 판이다. 그대로 두면 로고가 뚝 끊기고 빈 배경이 한 번 비친 뒤에 화면이
     * 뜬다. 페이지 로드가 끝나야 걷히게 해서 페이드가 실제 화면 위로 풀리게 한다.
     *
     * 데이터 로딩 화면이 잠깐 이어질 수는 있다. 그건 웹이 그리는 화면이라
     * 빈 판과 달리 의도한 모양이다.
     */
    private void keepSplashUntilWebReady(SplashScreen splash) {
        splash.setKeepOnScreenCondition(() -> !webReady);

        if (bridge == null) {
            /* 웹뷰를 못 만든 기기(no_webview 레이아웃). 기다릴 페이지가 없다. */
            webReady = true;
        } else {
            bridge.addWebViewListener(new WebViewListener() {
                @Override
                public void onPageLoaded(WebView webView) {
                    webReady = true;
                }

                @Override
                public void onReceivedError(WebView webView) {
                    webReady = true;
                }
            });

            new Handler(Looper.getMainLooper()).postDelayed(() -> webReady = true, SPLASH_MAX_MS);
        }

        /* 콜드 스타트에서만 불린다. 이미 떠 있던 앱으로 돌아올 때는 스플래시가
           없으므로 걷을 것도 없다. */
        splash.setOnExitAnimationListener(view -> view.getView()
                .animate()
                .alpha(0f)
                .setDuration(SPLASH_FADE_MS)
                .withEndAction(view::remove)
                .start());
    }
}
