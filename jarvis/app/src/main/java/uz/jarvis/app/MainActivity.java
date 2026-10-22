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
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.AlarmClock;
import android.provider.ContactsContract;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
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

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        prefs = getSharedPreferences("jarvis", MODE_PRIVATE);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClient());
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
    public void onBackPressed() {
        web.evaluateJavascript("J.back()", v -> { if (!"true".equals(v)) super.onBackPressed(); });
    }

    @Override
    protected void onDestroy() {
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

        @JavascriptInterface public void stopSpeak() { if (ttsReady) tts.stop(); }

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
