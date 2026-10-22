package uz.jarvis.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Locale;

/** Fonda "Jarvis" so'zini tinglaydigan xizmat. */
public class ListenService extends Service {
    static final String STOP = "uz.jarvis.STOP", PAUSE = "uz.jarvis.PAUSE", RESUME = "uz.jarvis.RESUME";
    static volatile boolean running = false;
    static volatile boolean paused = false;

    final Handler h = new Handler(Looper.getMainLooper());
    SpeechRecognizer rec;
    AudioManager am;
    PowerManager.WakeLock wl;
    boolean muted = false, listening = false;
    int errs = 0;
    String lang = "uz-UZ";

    @Override public IBinder onBind(Intent i) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
    }

    SharedPreferences prefs() { return getSharedPreferences("jarvis", MODE_PRIVATE); }

    void readSettings() {
        try {
            JSONObject s = new JSONObject(prefs().getString("set", "{}"));
            lang = s.optString("stt", "uz-UZ");
        } catch (Exception ignored) {}
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String a = intent != null ? intent.getAction() : null;
        if (STOP.equals(a)) {
            prefs().edit().putBoolean("bg", false).apply();
            try {
                JSONObject s = new JSONObject(prefs().getString("set", "{}"));
                s.put("bg", false);
                prefs().edit().putString("set", s.toString()).apply();
            } catch (Exception ignored) {}
            shutdown();
            return START_NOT_STICKY;
        }
        if (!running) {
            if (!startFg()) { stopSelf(); return START_NOT_STICKY; }
            running = true;
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "jarvis:listen");
            wl.setReferenceCounted(false);
            wl.acquire();
        }
        readSettings();
        if (PAUSE.equals(a)) {
            paused = true;
            h.removeCallbacksAndMessages(null);
            if (rec != null) { rec.cancel(); }
            listening = false;
            unmute();
        } else if (RESUME.equals(a)) {
            paused = false;
            listenSoon(700);
        } else if (!paused) {
            listenSoon(300);
        }
        return START_STICKY;
    }

    boolean startFg() {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel("jarvis_bg", "Fonda tinglash", NotificationManager.IMPORTANCE_LOW);
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
            b = new Notification.Builder(this, "jarvis_bg");
        } else {
            b = new Notification.Builder(this);
        }
        PendingIntent open = PendingIntent.getActivity(this, 0,
                new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop = PendingIntent.getService(this, 1,
                new Intent(this, ListenService.class).setAction(STOP),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        b.setSmallIcon(R.drawable.ic_n)
         .setContentTitle("Jarvis tinglayapti")
         .setContentText("\"Jarvis\" deb murojaat qiling")
         .setOngoing(true)
         .setContentIntent(open)
         .addAction(new Notification.Action.Builder(null, "To'xtatish", stop).build());
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(7, b.build(), ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
            else startForeground(7, b.build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    void shutdown() {
        running = false;
        h.removeCallbacksAndMessages(null);
        if (rec != null) { try { rec.destroy(); } catch (Exception ignored) {} rec = null; }
        unmute();
        if (wl != null && wl.isHeld()) wl.release();
        if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        running = false;
        h.removeCallbacksAndMessages(null);
        if (rec != null) { try { rec.destroy(); } catch (Exception ignored) {} rec = null; }
        unmute();
        if (wl != null && wl.isHeld()) wl.release();
        super.onDestroy();
    }

    // Google tanish signalini (bip) o'chirish — musiqa o'ynamayotgan bo'lsa
    void mute() {
        try {
            if (am.isMusicActive() && muted) { unmute(); return; }
            if (!muted && !am.isMusicActive()) {
                am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_MUTE, 0);
                muted = true;
            }
        } catch (Exception ignored) {}
    }

    void unmute() {
        try {
            if (muted) { am.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_UNMUTE, 0); muted = false; }
        } catch (Exception ignored) {}
    }

    void listenSoon(long ms) {
        h.removeCallbacksAndMessages(null);
        h.postDelayed(this::listen, ms);
    }

    void listen() {
        if (!running || paused || listening) return;
        if (!SpeechRecognizer.isRecognitionAvailable(this)) { listenSoon(30000); return; }
        if (rec == null) {
            rec = SpeechRecognizer.createSpeechRecognizer(this);
            rec.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle p) { errs = 0; }
                @Override public void onBeginningOfSpeech() {}
                @Override public void onRmsChanged(float v) {}
                @Override public void onBufferReceived(byte[] b) {}
                @Override public void onEndOfSpeech() {}
                @Override public void onError(int e) {
                    listening = false;
                    if (paused || !running) return;
                    if (e == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) { shutdown(); return; }
                    if (e == SpeechRecognizer.ERROR_RECOGNIZER_BUSY || e == SpeechRecognizer.ERROR_CLIENT) {
                        try { rec.destroy(); } catch (Exception ignored) {}
                        rec = null;
                    }
                    long d = (e == SpeechRecognizer.ERROR_NO_MATCH || e == SpeechRecognizer.ERROR_SPEECH_TIMEOUT)
                            ? 120 : Math.min(15000, 600L * (++errs));
                    listenSoon(d);
                }
                @Override public void onResults(Bundle r) {
                    listening = false;
                    ArrayList<String> l = r.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    String t = (l != null && !l.isEmpty()) ? l.get(0) : "";
                    if (paused || !running) return;
                    String cmd = afterWake(t);
                    if (cmd != null) wake(cmd);
                    else listenSoon(120);
                }
                @Override public void onPartialResults(Bundle r) {}
                @Override public void onEvent(int t, Bundle p) {}
            });
        }
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
        i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1200L);
        mute();
        try { rec.startListening(i); listening = true; }
        catch (Exception e) { listening = false; listenSoon(2000); }
    }

    void wake(String cmd) {
        unmute();
        paused = true;
        Intent i = new Intent(this, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        i.putExtra("wake", true);
        i.putExtra("cmd", cmd);
        try { startActivity(i); } catch (Exception ignored) {}
        // Android ilovani ochishga ruxsat bermasa — bildirishnoma orqali taklif qilamiz
        h.postDelayed(() -> {
            if (!MainActivity.visible) {
                notifyOpen(cmd, i);
                paused = false;
                listenSoon(300);
            }
        }, 2500);
    }

    void notifyOpen(String cmd, Intent i) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel("jarvis_call", "Jarvis chaqiruvi", NotificationManager.IMPORTANCE_HIGH);
            nm.createNotificationChannel(ch);
            b = new Notification.Builder(this, "jarvis_call");
        } else {
            b = new Notification.Builder(this);
            b.setPriority(Notification.PRIORITY_HIGH);
        }
        PendingIntent pi = PendingIntent.getActivity(this, 2, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        b.setSmallIcon(R.drawable.ic_n)
         .setContentTitle("Labbay! Bosing — Jarvis ochiladi")
         .setContentText(cmd.isEmpty() ? "Sizni eshitdim" : cmd)
         .setAutoCancel(true)
         .setContentIntent(pi);
        try { nm.notify(8, b.build()); } catch (Exception ignored) {}
    }

    // ---------- "Jarvis" so'zini topish ----------
    static String afterWake(String text) {
        if (text == null) return null;
        String t = text.toLowerCase(Locale.ROOT)
                .replace("джарвис", "jarvis").replace("жарвис", "jarvis").replace("жарвиз", "jarvis")
                .replace("дарвис", "jarvis").replace("чарвис", "jarvis");
        String[] w = t.split("[^\\p{L}\\p{N}'ʻ‘’]+");
        for (int k = 0; k < w.length; k++) {
            if (isWake(w[k])) {
                StringBuilder sb = new StringBuilder();
                for (int j = k + 1; j < w.length; j++) { if (sb.length() > 0) sb.append(' '); sb.append(w[j]); }
                return sb.toString().trim();
            }
        }
        return null;
    }

    static boolean isWake(String w) {
        if (w.length() < 4) return false;
        if (w.startsWith("jarv") || w.startsWith("djarv") || w.startsWith("jarw") || w.startsWith("charv")
                || w.startsWith("jerv") || w.startsWith("jarb") || w.startsWith("djerv")) return true;
        String head = w.length() > 6 ? w.substring(0, 6) : w;
        return w.length() >= 5 && lev(head, "jarvis") <= 1;
    }

    static int lev(String a, String b) {
        int[] p = new int[b.length() + 1], c = new int[b.length() + 1];
        for (int j = 0; j <= b.length(); j++) p[j] = j;
        for (int i = 1; i <= a.length(); i++) {
            c[0] = i;
            for (int j = 1; j <= b.length(); j++)
                c[j] = Math.min(Math.min(c[j - 1] + 1, p[j] + 1), p[j - 1] + (a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1));
            int[] tmp = p; p = c; c = tmp;
        }
        return p[b.length()];
    }
}
