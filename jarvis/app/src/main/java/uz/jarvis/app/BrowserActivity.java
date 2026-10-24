package uz.jarvis.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.inputmethod.EditorInfo;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/** Ilova ichidagi brauzer: GrabCAD, Sketchfab va h.k. saytlardan 3D fayl (GLB/STL/OBJ yoki ZIP) yuklab olib Jarvis'ga qaytaradi. */
public class BrowserActivity extends Activity {
    WebView wv; EditText url; TextView status;
    static final String UA = "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        LinearLayout root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(Color.parseColor("#06131d"));
        LinearLayout top = new LinearLayout(this); top.setOrientation(LinearLayout.HORIZONTAL); top.setPadding(8, 8, 8, 4); top.setGravity(Gravity.CENTER_VERTICAL);
        Button back = btn("◀"); back.setOnClickListener(v -> { if (wv.canGoBack()) wv.goBack(); });
        Button close = btn("✕"); close.setOnClickListener(v -> { setResult(RESULT_CANCELED); finish(); });
        url = new EditText(this); url.setSingleLine(true); url.setTextColor(Color.WHITE); url.setHintTextColor(Color.GRAY); url.setHint("sayt yoki qidiruv");
        url.setTextSize(14); url.setImeOptions(EditorInfo.IME_ACTION_GO);
        url.setOnEditorActionListener((v, a, e) -> { go(url.getText().toString()); return true; });
        top.addView(back); top.addView(url, new LinearLayout.LayoutParams(0, -2, 1)); top.addView(close);
        HorizontalScrollView hs = new HorizontalScrollView(this); LinearLayout row = new LinearLayout(this); row.setPadding(8, 0, 8, 4);
        String[][] sites = {{"GrabCAD", "https://grabcad.com/library"}, {"Sketchfab", "https://sketchfab.com/features/free-3d-models"}, {"Thingiverse", "https://www.thingiverse.com/"}, {"Printables", "https://www.printables.com/model"}, {"Cults", "https://cults3d.com/en/3d-models/free"}, {"Google", "https://www.google.com/search?q=free+3d+model+stl+download"}};
        for (String[] s : sites) { Button x = btn(s[0]); x.setOnClickListener(v -> go(s[1])); row.addView(x); }
        hs.addView(row);
        status = new TextView(this); status.setTextColor(Color.parseColor("#2fd8ff")); status.setTextSize(12); status.setPadding(16, 0, 16, 4);
        status.setText("Saytdan modelni tanlab, Yuklab olish (Download) ni bosing — GLB/STL/OBJ yoki ZIP. Kirish (login) kerak bo'lsa, o'zingiz kiring.");
        wv = new WebView(this);
        root.addView(top); root.addView(hs); root.addView(status); root.addView(wv, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(root);
        WebSettings s = wv.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setUserAgentString(UA); s.setLoadWithOverviewMode(true); s.setUseWideViewPort(true);
        CookieManager.getInstance().setAcceptCookie(true); CookieManager.getInstance().setAcceptThirdPartyCookies(wv, true);
        wv.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String u) { url.setText(u); }
        });
        wv.setWebChromeClient(new WebChromeClient());
        wv.setDownloadListener((u, ua, cd, mime, len) -> download(u, cd, mime));
        String start = getIntent().getStringExtra("url");
        go(start == null || start.isEmpty() ? "https://grabcad.com/library" : start);
    }

    Button btn(String t) { Button x = new Button(this); x.setText(t); x.setAllCaps(false); x.setTextSize(13); x.setMinWidth(0); x.setMinimumWidth(0); return x; }

    void go(String t) {
        t = t.trim(); if (t.isEmpty()) return;
        if (!t.contains(" ") && t.contains(".")) { if (!t.startsWith("http")) t = "https://" + t; }
        else if (!t.startsWith("http")) t = "https://www.google.com/search?q=" + android.net.Uri.encode(t + " 3d model stl");
        wv.loadUrl(t);
    }

    static boolean isModel(String n) { n = n.toLowerCase(Locale.ROOT); return n.endsWith(".glb") || n.endsWith(".stl") || n.endsWith(".obj"); }

    void download(String u, String cd, String mime) {
        final String name = URLUtil.guessFileName(u, cd, mime);
        final String ref = wv.getUrl() == null ? u : wv.getUrl();
        runOnUiThread(() -> status.setText("Yuklanmoqda: " + name + " …"));
        new Thread(() -> {
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(u).openConnection();
                c.setInstanceFollowRedirects(true); c.setConnectTimeout(20000); c.setReadTimeout(120000);
                c.setRequestProperty("User-Agent", UA);
                String ck = CookieManager.getInstance().getCookie(u); if (ck != null) c.setRequestProperty("Cookie", ck);
                c.setRequestProperty("Referer", ref);
                if (c.getResponseCode() != 200) { fail("Yuklab bo'lmadi (HTTP " + c.getResponseCode() + "). Saytga kirganingizni tekshiring."); return; }
                File dir = getCacheDir();
                File raw = new File(dir, "dl_raw.bin");
                try (InputStream is = c.getInputStream(); FileOutputStream fo = new FileOutputStream(raw)) { byte[] buf = new byte[32768]; int n; while ((n = is.read(buf)) > 0) fo.write(buf, 0, n); }
                String lower = name.toLowerCase(Locale.ROOT);
                File out = new File(dir, "dl_model.dat"); String outName = name;
                if (isModel(lower)) { copy(raw, out); }
                else if (lower.endsWith(".zip") || (mime != null && mime.contains("zip"))) {
                    String best = null; int bestRank = 9;
                    try (ZipInputStream z = new ZipInputStream(new java.io.FileInputStream(raw))) {
                        ZipEntry e; while ((e = z.getNextEntry()) != null) {
                            String en = e.getName().toLowerCase(Locale.ROOT); if (e.isDirectory() || !isModel(en)) continue;
                            int rank = en.endsWith(".glb") ? 0 : en.endsWith(".obj") ? 1 : 2; if (rank >= bestRank) continue;
                            try (FileOutputStream fo = new FileOutputStream(out)) { byte[] buf = new byte[32768]; int n; while ((n = z.read(buf)) > 0) fo.write(buf, 0, n); }
                            best = e.getName(); bestRank = rank;
                        }
                    }
                    if (best == null) { fail("ZIP ichida GLB/STL/OBJ yo'q (STEP/SLDPRT/F3D Jarvis'da ochilmaydi). Boshqa modelni tanlang yoki formatni STL qiling."); return; }
                    outName = new File(best).getName();
                } else { fail("Bu format ochilmaydi: " + name + ". GLB, STL yoki OBJ (yoki shularni o'z ichiga olgan ZIP) kerak."); return; }
                final String fn = outName; final long len = out.length();
                runOnUiThread(() -> { Intent r = new Intent(); r.putExtra("name", fn); r.putExtra("len", len); setResult(RESULT_OK, r); finish(); });
            } catch (Exception e) { fail("Xato: " + e.getMessage()); }
        }).start();
    }

    void fail(String m) { runOnUiThread(() -> { status.setText(m); Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }); }

    static void copy(File a, File b) throws Exception { try (InputStream is = new java.io.FileInputStream(a); FileOutputStream fo = new FileOutputStream(b)) { byte[] buf = new byte[32768]; int n; while ((n = is.read(buf)) > 0) fo.write(buf, 0, n); } }

    @Override public void onBackPressed() { if (wv.canGoBack()) wv.goBack(); else { setResult(RESULT_CANCELED); finish(); } }
}
