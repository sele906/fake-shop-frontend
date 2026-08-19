package com.ansam.app;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.appcompat.app.AppCompatDelegate;

/**
 * 앱이 고른 테마를 네이티브 쪽에 보관하고 AppCompat 모드로 옮긴다.
 *
 * 웹은 localStorage에 저장하지만 자바에서는 그걸 못 읽는다. 앱이 뜨는 순간
 * (웹뷰가 그려지기 전에) 테마를 알아야 해서 SharedPreferences에 한 벌 더 둔다.
 * 쓰는 쪽은 ThemePlugin, 읽는 쪽은 MainActivity다.
 *
 * 두 벌이 어긋날 수 있는 창은 "웹은 바꿨는데 플러그인 호출이 실패한" 경우뿐이고,
 * 그때도 다음 실행에서 웹이 다시 부르면 맞춰진다.
 */
final class ThemeStore {

    static final String LIGHT = "light";
    static final String DARK = "dark";
    static final String SYSTEM = "system";

    private static final String PREFS = "ansam";
    private static final String KEY = "nightMode";

    private ThemeStore() {}

    static String load(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        return prefs.getString(KEY, SYSTEM);
    }

    static void save(Context context, String mode) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY, mode)
                .apply();
    }

    /**
     * MODE_NIGHT_FOLLOW_SYSTEM이 기본값이다. 모르는 값이 오면 시스템을 따른다 —
     * 웹이 새 값을 보내기 시작해도 앱이 멈추지는 않게.
     */
    static int toDelegateMode(String mode) {
        if (DARK.equals(mode)) return AppCompatDelegate.MODE_NIGHT_YES;
        if (LIGHT.equals(mode)) return AppCompatDelegate.MODE_NIGHT_NO;
        return AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM;
    }
}
