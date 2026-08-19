package com.ansam.app;

import android.content.Context;
import android.util.TypedValue;
import android.view.View;

import androidx.appcompat.app.AppCompatDelegate;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * 웹에서 고른 테마를 안드로이드 나이트 모드에 옮긴다.
 *
 * targetSdk 35부터 엣지투엣지가 강제라 android:statusBarColor는 무시된다.
 * 상태바는 투명해지고 그 뒤에 창 배경(android:windowBackground)이 비친다.
 * 그 값은 values-night에서 오는데, 어느 쪽을 쓸지는 시스템 다크 설정이 정한다 —
 * 앱 안 토글은 모른다. 그래서 여기서 AppCompatDelegate로 리소스 설정 자체를
 * 바꿔 준다. 그러면 values-night가 "시스템이 다크일 때"가 아니라 "앱이 다크를
 * 고를 때" 적용된다.
 *
 * 매니페스트의 configChanges에 uiMode가 있어서 이 전환은 액티비티를 다시 만들지
 * 않는다 — 웹뷰가 리로드되지 않는다. 대신 창 배경이 저절로 다시 칠해지지도
 * 않으므로 아래에서 직접 칠한다.
 */
@CapacitorPlugin(name = "Theme")
public class ThemePlugin extends Plugin {

    /**
     * mode: "light" | "dark" | "system"
     */
    @PluginMethod
    public void setNightMode(PluginCall call) {
        final String mode = call.getString("mode", ThemeStore.SYSTEM);

        ThemeStore.save(getContext(), mode);

        getActivity().runOnUiThread(() -> {
            AppCompatDelegate.setDefaultNightMode(ThemeStore.toDelegateMode(mode));
            repaintWindowBackground();
        });

        call.resolve();
    }

    /**
     * 지금 걸려 있는 값을 돌려준다. 웹이 저장한 것과 어긋났는지 볼 때 쓴다.
     */
    @PluginMethod
    public void getNightMode(PluginCall call) {
        com.getcapacitor.JSObject result = new com.getcapacitor.JSObject();
        result.put("mode", ThemeStore.load(getContext()));
        call.resolve(result);
    }

    /**
     * 액티비티가 다시 만들어지지 않으므로 창 배경을 손으로 다시 칠한다.
     *
     * post로 미루는 것은 setDefaultNightMode가 onConfigurationChanged를 통해
     * 리소스를 갈아끼우기 때문이다. 같은 프레임에 읽으면 옛 색이 나온다.
     *
     * Capacitor의 SystemBars 플러그인도 setStyle에서 같은 일을 한다
     * (SystemBars.java의 decorView.setBackgroundColor). 거기서는 스타일이 바뀔
     * 때만 도는데, 우리는 나이트 모드가 바뀔 때도 필요하다.
     */
    private void repaintWindowBackground() {
        final View decor = getActivity().getWindow().getDecorView();

        decor.post(() -> {
            TypedValue value = new TypedValue();
            Context context = getActivity();

            if (context.getTheme().resolveAttribute(android.R.attr.windowBackground, value, true)
                    && value.type >= TypedValue.TYPE_FIRST_COLOR_INT
                    && value.type <= TypedValue.TYPE_LAST_COLOR_INT) {
                decor.setBackgroundColor(value.data);
            }
        });
    }
}
