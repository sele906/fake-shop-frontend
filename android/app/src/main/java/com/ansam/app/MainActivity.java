package com.ansam.app;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatDelegate;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        /* 플러그인 등록과 나이트 모드는 둘 다 super.onCreate 앞이어야 한다.
           super가 테마를 적용하고 화면을 만들기 때문에, 그 뒤에 모드를 바꾸면
           첫 프레임이 옛 색으로 한 번 그려진다. */
        registerPlugin(ThemePlugin.class);

        AppCompatDelegate.setDefaultNightMode(
                ThemeStore.toDelegateMode(ThemeStore.load(this)));

        super.onCreate(savedInstanceState);
    }
}
