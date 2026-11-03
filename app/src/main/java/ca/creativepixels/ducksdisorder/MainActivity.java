package ca.creativepixels.ducksdisorder;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private static final int NOTIFICATION_PERMISSION_REQUEST = 613;
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(21, 23, 28));
        getWindow().setNavigationBarColor(Color.rgb(18, 21, 27));

        ReminderScheduler.createChannel(this);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(18, 21, 27));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowContentAccess(false);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        webView.getSettings().setDefaultTextEncodingName("UTF-8");
        webView.addJavascriptInterface(new SaveBridge(), "DucksBridge");
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !request.getUrl().toString().startsWith("file:///android_asset/");
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (getIntent().getBooleanExtra("open_life", false)) {
                    view.evaluateJavascript("window.ducks && window.ducks.show('tasks');", null);
                    getIntent().removeExtra("open_life");
                }
            }
        });
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent.getBooleanExtra("open_life", false) && webView != null) {
            webView.evaluateJavascript("window.ducks && window.ducks.show('tasks');", null);
            intent.removeExtra("open_life");
        }
    }

    private void notifyWeb(boolean enabled) {
        if (webView != null) {
            webView.evaluateJavascript("window.ducks && window.ducks.remindersChanged(" + enabled + ");", null);
        }
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == NOTIFICATION_PERMISSION_REQUEST) {
            boolean allowed = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
            if (allowed) ReminderScheduler.enable(this);
            notifyWeb(allowed);
        }
    }

    private final class SaveBridge {
        @JavascriptInterface public String load() {
            return getSharedPreferences("ducks_game", MODE_PRIVATE).getString("state", "");
        }
        @JavascriptInterface public void save(String json) {
            if (json != null && json.length() < 200000) {
                getSharedPreferences("ducks_game", MODE_PRIVATE).edit().putString("state", json).apply();
            }
        }
        @JavascriptInterface public void backup(String json) {
            runOnUiThread(() -> {
                Intent send = new Intent(Intent.ACTION_SEND);
                send.setType("text/plain");
                send.putExtra(Intent.EXTRA_TEXT, json);
                startActivity(Intent.createChooser(send, "Save your Ducks & Disorder backup"));
            });
        }
        @JavascriptInterface public boolean remindersEnabled() {
            return ReminderScheduler.isEnabled(MainActivity.this);
        }
        @JavascriptInterface public void enableReminders() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= 33 &&
                        checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},
                            NOTIFICATION_PERMISSION_REQUEST);
                } else {
                    ReminderScheduler.enable(MainActivity.this);
                    notifyWeb(ReminderScheduler.isEnabled(MainActivity.this));
                }
            });
        }
        @JavascriptInterface public void disableReminders() {
            runOnUiThread(() -> {
                ReminderScheduler.disable(MainActivity.this);
                notifyWeb(false);
            });
        }
    }

    @Override protected void onDestroy() {
        if (webView != null) {
            webView.removeJavascriptInterface("DucksBridge");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}