package uz.jarvis.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.database.Cursor;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.content.ContentValues;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.provider.MediaStore;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import android.os.PowerManager;
import android.provider.Settings;
import android.provider.AlarmClock;
import android.provider.ContactsContract;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {
    WebView web;
    SpeechRecognizer rec;
    TextToSpeech tts;
    boolean ttsReady = false;
    String ttsLang = "";
    SharedPreferences prefs;
    long lastRms = 0;
    static volatile boolean visible = false;
    static MainActivity inst;
    boolean pageReady = false;
    String pendingCmd = null;
    Uri camUri = null;
    MediaPlayer player = null;
    static final int REQ_IMG = 41;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        inst = this;
        prefs = getSharedPreferences("jarvis", MODE_PRIVATE);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView v, String url) {
                pageReady = true;
                if (pendingCmd != null) { deliver(pendingCmd); pendingCmd = null; }
            }
        });
        web.setWebChromeClient(new WebChromeClient());
        web.setBackgroundColor(0xFF05101A);
        web.addJavascriptInterface(new Bridge(), "Native");
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                ttsReady = true;
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { js("J.onSpeakStart()"); }
                    @Override public void onDone(String id) { js("J.onSpeakDone()"); }
                    @Override public void onError(String id) { js("J.onSpeakDone()"); }
                });
                js("J.onTtsReady()");
            }
        });

        List<String> need = new ArrayList<>();
        need.add(Manifest.permission.RECORD_AUDIO);
        if (Build.VERSION.SDK_INT >= 33) need.add(Manifest.permission.POST_NOTIFICATIONS);
        askPerms(need.toArray(new String[0]));
        takeIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        setIntent(i);
        takeIntent(i);
    }

    void takeIntent(Intent i) {
        if (i != null && i.getBooleanExtra("report", false)) {
            i.removeExtra("report");
            if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
            if (pageReady) js("J.morning()"); else pendingCmd = "#report#";
            return;
        }
        if (i == null || !i.getBooleanExtra("wake", false)) return;
        String cmd = i.getStringExtra("cmd");
        i.removeExtra("wake");
        if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
        else getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        if (pageReady) deliver(cmd == null ? "" : cmd); else pendingCmd = cmd == null ? "" : cmd;
    }

    void deliver(String cmd) {
        if ("#report#".equals(cmd)) js("J.morning()");
        else js("J.external(" + q(cmd) + ")");
    }

    boolean bgOn() { return prefs.getBoolean("bg", false); }

    void svc(String action) {
        try {
            Intent i = new Intent(this, ListenService.class).setAction(action);
            if (Build.VERSION.SDK_INT >= 26) startForegroundService(i); else startService(i);
        } catch (Exception ignored) {}
    }

    @Override
    protected void onResume() {
        super.onResume();
        visible = true;
        if (bgOn()) svc(ListenService.PAUSE);
        js("J.onShown && J.onShown()");
    }

    @Override
    protected void onPause() {
        visible = false;
        js("J.onHidden && J.onHidden()");
        if (rec != null) rec.cancel();
        if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(false); setTurnScreenOn(false); }
        else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        if (bgOn()) svc(ListenService.RESUME);
        super.onPause();
    }

    void askPerms(String[] perms) {
        if (Build.VERSION.SDK_INT < 23) return;
        List<String> miss = new ArrayList<>();
        for (String p : perms) if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) miss.add(p);
        if (!miss.isEmpty()) requestPermissions(miss.toArray(new String[0]), 7);
    }

    boolean has(String p) {
        return Build.VERSION.SDK_INT < 23 || checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED;
    }

    void js(String code) {
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript(code, null); });
    }

    static String q(String s) { return JSONObject.quote(s == null ? "" : s); }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req != REQ_IMG) return;
        if (res != RESULT_OK) { js("J.onImage('')"); return; }
        Uri u = (data != null && data.getData() != null) ? data.getData() : camUri;
        if (u == null) { js("J.onImage('')"); return; }
        final Uri fu = u;
        new Thread(() -> {
            String out = "";
            try {
                BitmapFactory.Options o = new BitmapFactory.Options();
                o.inJustDecodeBounds = true;
                try (InputStream is = getContentResolver().openInputStream(fu)) { BitmapFactory.decodeStream(is, null, o); }
                int max = Math.max(o.outWidth, o.outHeight), sample = 1;
                while (max / (sample * 2) >= 1280) sample *= 2;
                BitmapFactory.Options o2 = new BitmapFactory.Options();
                o2.inSampleSize = sample;
                Bitmap bm;
                try (InputStream is = getContentResolver().openInputStream(fu)) { bm = BitmapFactory.decodeStream(is, null, o2); }
                int rot = 0;
                try (InputStream is = getContentResolver().openInputStream(fu)) {
                    if (Build.VERSION.SDK_INT >= 24) {
                        int ori = new ExifInterface(is).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
                        rot = ori == ExifInterface.ORIENTATION_ROTATE_90 ? 90 : ori == ExifInterface.ORIENTATION_ROTATE_180 ? 180 : ori == ExifInterface.ORIENTATION_ROTATE_270 ? 270 : 0;
                    }
                } catch (Exception ignored) {}
                float sc = Math.min(1f, 1280f / Math.max(bm.getWidth(), bm.getHeight()));
                Matrix mx = new Matrix(); mx.postScale(sc, sc); if (rot != 0) mx.postRotate(rot);
                Bitmap b2 = Bitmap.createBitmap(bm, 0, 0, bm.getWidth(), bm.getHeight(), mx, true);
                ByteArrayOutputStream bo = new ByteArrayOutputStream();
                b2.compress(Bitmap.CompressFormat.JPEG, 82, bo);
                out = Base64.encodeToString(bo.toByteArray(), Base64.NO_WRAP);
            } catch (Exception e) { out = ""; }
            js("J.onImage(" + q(out) + ")");
        }).start();
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("J.back()", v -> { if (!"true".equals(v)) super.onBackPressed(); });
    }

    @Override
    protected void onDestroy() {
        if (inst == this) inst = null;
        if (rec != null) rec.destroy();
        if (tts != null) tts.shutdown();
        super.onDestroy();
    }

    void startListen(String lang) {
        if (!has(Manifest.permission.RECORD_AUDIO)) {
            askPerms(new String[]{Manifest.permission.RECORD_AUDIO});
            js("J.onSpeechError(9)");
            return;
        }
        if (!SpeechRecognizer.isRecognitionAvailable(this)) { js("J.onSpeechError(100)"); return; }
        if (rec == null) {
            rec = SpeechRecognizer.createSpeechRecognizer(this);
            rec.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle p) { js("J.onListenStart()"); }
                @Override public void onBeginningOfSpeech() {}
                @Override public void onRmsChanged(float v) {
                    long now = System.currentTimeMillis();
                    if (now - lastRms > 90) { lastRms = now; js("J.onRms(" + v + ")"); }
                }
                @Override public void onBufferReceived(byte[] buf) {}
                @Override public void onEndOfSpeech() { js("J.onListenEnd()"); }
                @Override public void onError(int e) { js("J.onSpeechError(" + e + ")"); }
                @Override public void onResults(Bundle r) {
                    ArrayList<String> l = r.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    js("J.onSpeech(" + q(l != null && !l.isEmpty() ? l.get(0) : "") + ")");
                }
                @Override public void onPartialResults(Bundle r) {
                    ArrayList<String> l = r.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (l != null && !l.isEmpty()) js("J.onPartial(" + q(l.get(0)) + ")");
                }
                @Override public void onEvent(int t, Bundle p) {}
            });
        }
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);
        rec.startListening(i);
    }

    class Bridge {
        // ---------- ovoz ----------
        @JavascriptInterface public void listen(String lang) { runOnUiThread(() -> startListen(lang)); }
        @JavascriptInterface public void stopListen() { runOnUiThread(() -> { if (rec != null) rec.cancel(); }); }

        @JavascriptInterface public String setVoice(String lang) {
            if (!ttsReady) return "wait";
            String[] tries = lang.split(",");
            for (String t : tries) {
                Locale loc = Locale.forLanguageTag(t.trim());
                int r = tts.isLanguageAvailable(loc);
                if (r >= TextToSpeech.LANG_AVAILABLE) { tts.setLanguage(loc); ttsLang = t.trim(); return ttsLang; }
            }
            ttsLang = "default";
            return ttsLang;
        }

        @JavascriptInterface public String voices() {
            JSONArray a = new JSONArray();
            try {
                if (ttsReady && tts.getVoices() != null)
                    for (Voice v : tts.getVoices()) a.put(v.getLocale().toLanguageTag());
            } catch (Exception ignored) {}
            return a.toString();
        }

        @JavascriptInterface public void speak(String text, float rate, float pitch) {
            if (!ttsReady) { js("J.onSpeakDone()"); return; }
            tts.setSpeechRate(rate);
            tts.setPitch(pitch);
            Bundle p = new Bundle();
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, p, "j" + System.currentTimeMillis());
        }

        @JavascriptInterface public void stopSpeak() {
            if (ttsReady) tts.stop();
            runOnUiThread(() -> { if (player != null) { try { player.stop(); player.release(); } catch (Exception ignored) {} player = null; } });
        }

        /** Bulut ovozi (Azure): SSML yuboriladi, mp3 olinib o'ynatiladi. */
        @JavascriptInterface public void cloudSpeak(String url, String headers, String body) {
            new Thread(() -> {
                try {
                    HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                    c.setRequestMethod("POST");
                    c.setConnectTimeout(15000);
                    c.setReadTimeout(30000);
                    JSONObject h = new JSONObject(headers);
                    Iterator<String> it = h.keys();
                    while (it.hasNext()) { String k = it.next(); c.setRequestProperty(k, h.getString(k)); }
                    c.setDoOutput(true);
                    try (OutputStream os = c.getOutputStream()) { os.write(body.getBytes(StandardCharsets.UTF_8)); }
                    int code = c.getResponseCode();
                    if (code != 200) { js("J.onCloudFail(" + code + ")"); return; }
                    File f = new File(getCacheDir(), "say.mp3");
                    try (InputStream is = c.getInputStream(); FileOutputStream fo = new FileOutputStream(f)) {
                        byte[] buf = new byte[8192]; int n;
                        while ((n = is.read(buf)) > 0) fo.write(buf, 0, n);
                    }
                    runOnUiThread(() -> {
                        try {
                            if (player != null) { player.release(); player = null; }
                            player = new MediaPlayer();
                            player.setDataSource(f.getAbsolutePath());
                            player.setOnCompletionListener(mp -> { js("J.onSpeakDone()"); });
                            player.setOnErrorListener((mp, w, e) -> { js("J.onSpeakDone()"); return true; });
                            player.prepare();
                            player.start();
                            js("J.onSpeakStart()");
                        } catch (Exception e) { js("J.onCloudFail(-2)"); }
                    });
                } catch (Exception e) {
                    js("J.onCloudFail(0)");
                }
            }).start();
        }

        // ---------- xotira ----------
        @JavascriptInterface public void save(String k, String v) { prefs.edit().putString(k, v).apply(); }
        @JavascriptInterface public String load(String k) { return prefs.getString(k, ""); }

        // ---------- internet (AI) ----------
        @JavascriptInterface public void http(String id, String url, String method, String headers, String body) {
            new Thread(() -> {
                int code = 0; String out;
                try {
                    HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                    c.setRequestMethod(method);
                    c.setConnectTimeout(20000);
                    c.setReadTimeout(60000);
                    JSONObject h = new JSONObject(headers.isEmpty() ? "{}" : headers);
                    Iterator<String> it = h.keys();
                    while (it.hasNext()) { String k = it.next(); c.setRequestProperty(k, h.getString(k)); }
                    if (body != null && !body.isEmpty()) {
                        c.setDoOutput(true);
                        OutputStream os = c.getOutputStream();
                        os.write(body.getBytes(StandardCharsets.UTF_8));
                        os.close();
                    }
                    code = c.getResponseCode();
                    InputStream is = code >= 400 ? c.getErrorStream() : c.getInputStream();
                    StringBuilder sb = new StringBuilder();
                    if (is != null) {
                        BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
                        String line;
                        while ((line = br.readLine()) != null) sb.append(line).append('\n');
                        br.close();
                    }
                    out = sb.toString();
                } catch (Exception e) {
                    out = "ERR: " + e.getMessage();
                }
                js("J._http(" + q(id) + "," + code + "," + q(out) + ")");
            }).start();
        }

        // ---------- telefon ----------
        @JavascriptInterface public String call(String number) {
            try {
                Intent i;
                if (has(Manifest.permission.CALL_PHONE)) i = new Intent(Intent.ACTION_CALL, Uri.parse("tel:" + Uri.encode(number)));
                else {
                    askPerms(new String[]{Manifest.permission.CALL_PHONE});
                    i = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + Uri.encode(number)));
                }
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        @JavascriptInterface public String sms(String number, String text) {
            try {
                Intent i = new Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:" + Uri.encode(number)));
                i.putExtra("sms_body", text);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        @JavascriptInterface public String contacts(String name) {
            JSONArray a = new JSONArray();
            if (!has(Manifest.permission.READ_CONTACTS)) {
                askPerms(new String[]{Manifest.permission.READ_CONTACTS});
                return "noperm";
            }
            try (Cursor c = getContentResolver().query(
                    ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                    new String[]{ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME, ContactsContract.CommonDataKinds.Phone.NUMBER},
                    ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " LIKE ?",
                    new String[]{"%" + name + "%"}, null)) {
                while (c != null && c.moveToNext() && a.length() < 8) {
                    JSONObject o = new JSONObject();
                    o.put("name", c.getString(0));
                    o.put("number", c.getString(1));
                    a.put(o);
                }
            } catch (Exception ignored) {}
            return a.toString();
        }

        @JavascriptInterface public String alarm(int hour, int min, String msg) {
            try {
                Intent i = new Intent(AlarmClock.ACTION_SET_ALARM);
                i.putExtra(AlarmClock.EXTRA_HOUR, hour);
                i.putExtra(AlarmClock.EXTRA_MINUTES, min);
                i.putExtra(AlarmClock.EXTRA_MESSAGE, msg);
                i.putExtra(AlarmClock.EXTRA_SKIP_UI, true);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        @JavascriptInterface public String timer(int seconds, String msg) {
            try {
                Intent i = new Intent(AlarmClock.ACTION_SET_TIMER);
                i.putExtra(AlarmClock.EXTRA_LENGTH, seconds);
                i.putExtra(AlarmClock.EXTRA_MESSAGE, msg);
                i.putExtra(AlarmClock.EXTRA_SKIP_UI, true);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        @JavascriptInterface public String remind(long at, String text, int id) {
            try {
                AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                Intent i = new Intent(MainActivity.this, ReminderReceiver.class);
                i.putExtra("text", text);
                i.putExtra("id", id);
                PendingIntent pi = PendingIntent.getBroadcast(MainActivity.this, id, i,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        @JavascriptInterface public void cancelRemind(int id) {
            try {
                AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                Intent i = new Intent(MainActivity.this, ReminderReceiver.class);
                PendingIntent pi = PendingIntent.getBroadcast(MainActivity.this, id, i,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                am.cancel(pi);
            } catch (Exception ignored) {}
        }

        @JavascriptInterface public String openApp(String name) {
            String n = name.toLowerCase(Locale.ROOT).trim();
            PackageManager pm = getPackageManager();
            Intent m = new Intent(Intent.ACTION_MAIN);
            m.addCategory(Intent.CATEGORY_LAUNCHER);
            List<ResolveInfo> apps = pm.queryIntentActivities(m, 0);
            ResolveInfo best = null;
            for (ResolveInfo r : apps) {
                String label = String.valueOf(r.loadLabel(pm)).toLowerCase(Locale.ROOT);
                String pkg = r.activityInfo.packageName.toLowerCase(Locale.ROOT);
                if (label.equals(n) || pkg.equals(n)) { best = r; break; }
                if (best == null && (label.contains(n) || n.contains(label) || pkg.contains(n))) best = r;
            }
            if (best == null) return "notfound";
            Intent li = pm.getLaunchIntentForPackage(best.activityInfo.packageName);
            if (li == null) return "notfound";
            li.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(li);
            return String.valueOf(best.loadLabel(pm));
        }

        @JavascriptInterface public String openUrl(String url) {
            try {
                Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        @JavascriptInterface public String torch(boolean on) {
            try {
                CameraManager cm = (CameraManager) getSystemService(Context.CAMERA_SERVICE);
                for (String id : cm.getCameraIdList()) {
                    Boolean f = cm.getCameraCharacteristics(id).get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                    if (f != null && f) { cm.setTorchMode(id, on); return "ok"; }
                }
                return "noflash";
            } catch (Exception e) { return "err"; }
        }

        @JavascriptInterface public int battery() {
            try {
                BatteryManager bm = (BatteryManager) getSystemService(Context.BATTERY_SERVICE);
                return bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
            } catch (Exception e) { return -1; }
        }

        @JavascriptInterface public void volume(int percent) {
            try {
                AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
                int max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                int v = Math.max(0, Math.min(max, Math.round(max * percent / 100f)));
                am.setStreamVolume(AudioManager.STREAM_MUSIC, v, AudioManager.FLAG_SHOW_UI);
            } catch (Exception ignored) {}
        }

        @JavascriptInterface public void keepAwake(boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }

        @JavascriptInterface public void pickImage(boolean camera) {
            runOnUiThread(() -> {
                try {
                    if (camera) {
                        ContentValues cv = new ContentValues();
                        cv.put(MediaStore.Images.Media.DISPLAY_NAME, "jarvis_" + System.currentTimeMillis() + ".jpg");
                        cv.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
                        camUri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cv);
                        Intent i = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                        i.putExtra(MediaStore.EXTRA_OUTPUT, camUri);
                        startActivityForResult(i, REQ_IMG);
                    } else {
                        Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                        i.setType("image/*");
                        startActivityForResult(Intent.createChooser(i, "Rasm tanlang"), REQ_IMG);
                    }
                } catch (Exception e) {
                    js("J.onImage('')");
                }
            });
        }

        @JavascriptInterface public String saveFile(String name, String mime, String content) {
            try {
                byte[] data = content.getBytes(StandardCharsets.UTF_8);
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.Downloads.DISPLAY_NAME, name);
                    cv.put(MediaStore.Downloads.MIME_TYPE, mime);
                    cv.put(MediaStore.Downloads.RELATIVE_PATH, "Download/Jarvis");
                    Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                    try (OutputStream os = getContentResolver().openOutputStream(u)) { os.write(data); }
                    return u.toString();
                } else {
                    File dir = getExternalFilesDir(android.os.Environment.DIRECTORY_DOWNLOADS);
                    File f = new File(dir, name);
                    try (FileOutputStream fo = new FileOutputStream(f)) { fo.write(data); }
                    return "file://" + f.getAbsolutePath();
                }
            } catch (Exception e) { return ""; }
        }

        @JavascriptInterface public void shareFile(String uri, String mime) {
            try {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType(mime);
                i.putExtra(Intent.EXTRA_STREAM, Uri.parse(uri));
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                Intent c = Intent.createChooser(i, "Faylni yuborish");
                c.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(c);
            } catch (Exception ignored) {}
        }

        @JavascriptInterface public String readAsset(String path) {
            try (InputStream is = getAssets().open(path)) {
                ByteArrayOutputStream bo = new ByteArrayOutputStream();
                byte[] buf = new byte[16384]; int n;
                while ((n = is.read(buf)) > 0) bo.write(buf, 0, n);
                return Base64.encodeToString(bo.toByteArray(), Base64.NO_WRAP);
            } catch (Exception e) { return ""; }
        }

        @JavascriptInterface public String recentMsgs(int n) { return MsgReceiver.recent(MainActivity.this, n); }

        @JavascriptInterface public String reply(String to, String text) { return MsgReceiver.reply(MainActivity.this, to, text); }

        @JavascriptInterface public boolean xabarInstalled() { return MsgReceiver.installed(MainActivity.this); }

        @JavascriptInterface public boolean hasNotifAccess() {
            String s = Settings.Secure.getString(getContentResolver(), "enabled_notification_listeners");
            return s != null && s.contains(MsgReceiver.XABAR) && MsgReceiver.installed(MainActivity.this);
        }

        @JavascriptInterface public void askNotifAccess() {
            Intent i = getPackageManager().getLaunchIntentForPackage(MsgReceiver.XABAR);
            if (i == null) {
                try { i = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS); } catch (Exception e) { return; }
            }
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try { startActivity(i); } catch (Exception ignored) {}
        }

        @JavascriptInterface public void pushMsgSettings(String readMsg, boolean car) { MsgReceiver.settings(MainActivity.this, readMsg, car); }

        @JavascriptInterface public void copy(String text) {
            runOnUiThread(() -> {
                try {
                    android.content.ClipboardManager cm = (android.content.ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                    cm.setPrimaryClip(android.content.ClipData.newPlainText("Jarvis", text));
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface public void scheduleReport(boolean on, int h, int m) { ReportReceiver.schedule(MainActivity.this, on, h, m); }

        @JavascriptInterface public String media(String cmd) {
            int code;
            switch (cmd) {
                case "next": code = KeyEvent.KEYCODE_MEDIA_NEXT; break;
                case "prev": code = KeyEvent.KEYCODE_MEDIA_PREVIOUS; break;
                case "pause": code = KeyEvent.KEYCODE_MEDIA_PAUSE; break;
                case "play": code = KeyEvent.KEYCODE_MEDIA_PLAY; break;
                default: code = KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE;
            }
            try {
                AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
                am.dispatchMediaKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, code));
                am.dispatchMediaKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, code));
                return "ok";
            } catch (Exception e) { return "err"; }
        }

        @JavascriptInterface public String navigate(String q, String app) {
            String[] urls;
            String e = Uri.encode(q);
            if ("google".equals(app)) urls = new String[]{"google.navigation:q=" + e, "geo:0,0?q=" + e};
            else if ("yandex".equals(app)) urls = new String[]{"yandexnavi://map_search?text=" + e, "yandexmaps://maps.yandex.ru/?text=" + e, "geo:0,0?q=" + e};
            else urls = new String[]{"yandexnavi://map_search?text=" + e, "google.navigation:q=" + e, "yandexmaps://maps.yandex.ru/?text=" + e, "geo:0,0?q=" + e};
            for (String u : urls) {
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(u));
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    if (i.resolveActivity(getPackageManager()) == null) continue;
                    startActivity(i);
                    return u.startsWith("yandexnavi") ? "Yandex Navigator" : u.startsWith("google") ? "Google Maps" : u.startsWith("yandexmaps") ? "Yandex Xaritalar" : "xarita";
                } catch (Exception ignored) {}
            }
            return "none";
        }

        @JavascriptInterface public String bgListen(boolean on) {
            prefs.edit().putBoolean("bg", on).apply();
            if (on) {
                if (!has(Manifest.permission.RECORD_AUDIO)) { askPerms(new String[]{Manifest.permission.RECORD_AUDIO}); return "noperm"; }
                svc("start");
                svc(ListenService.PAUSE); // ilova ochiq — o'zi tinglaydi
            } else {
                stopService(new Intent(MainActivity.this, ListenService.class));
            }
            return "ok";
        }

        @JavascriptInterface public boolean bgRunning() { return ListenService.running; }

        @JavascriptInterface public boolean canOverlay() {
            return Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(MainActivity.this);
        }

        @JavascriptInterface public void askOverlay() {
            try {
                Intent i = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
                startActivity(i);
            } catch (Exception e) { appSettings(); }
        }

        @JavascriptInterface public boolean batteryOk() {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            return pm.isIgnoringBatteryOptimizations(getPackageName());
        }

        @JavascriptInterface public void askBattery() {
            try {
                Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getPackageName()));
                startActivity(i);
            } catch (Exception e) { appSettings(); }
        }

        @JavascriptInterface public void appSettings() {
            try {
                Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (Exception ignored) {}
        }

        @JavascriptInterface public void toBack() { runOnUiThread(() -> moveTaskToBack(true)); }

        @JavascriptInterface public void share(String text) {
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(Intent.EXTRA_TEXT, text);
            Intent c = Intent.createChooser(i, "Ulashish");
            c.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(c);
        }
    }
}
