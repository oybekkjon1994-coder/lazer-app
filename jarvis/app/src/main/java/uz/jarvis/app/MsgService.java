package uz.jarvis.app;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.RemoteInput;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.speech.tts.TextToSpeech;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Locale;

/** Kelgan Telegram / WhatsApp / Instagram / SMS xabarlarini o'qiydi va ularga javob yuboradi. */
public class MsgService extends NotificationListenerService {
    static class Msg {
        String app, from, text, key;
        long time;
        Notification.Action reply;
    }

    static final ArrayList<Msg> list = new ArrayList<>();
    static MsgService inst;
    TextToSpeech tts;
    boolean ttsOk = false;
    String lastSig = "";

    static String appName(String pkg) {
        if (pkg.contains("telegram")) return "Telegram";
        if (pkg.contains("whatsapp")) return "WhatsApp";
        if (pkg.contains("instagram")) return "Instagram";
        if (pkg.contains("mms") || pkg.contains("messaging") || pkg.contains("sms")) return "SMS";
        return null;
    }

    @Override
    public void onListenerConnected() {
        inst = this;
        tts = new TextToSpeech(this, s -> {
            if (s == TextToSpeech.SUCCESS) {
                ttsOk = true;
                Locale[] tries = {Locale.forLanguageTag("uz-UZ"), Locale.forLanguageTag("tr-TR"), Locale.forLanguageTag("ru-RU")};
                for (Locale l : tries) if (tts.isLanguageAvailable(l) >= TextToSpeech.LANG_AVAILABLE) { tts.setLanguage(l); break; }
                tts.setPitch(0.85f);
            }
        });
    }

    @Override
    public void onListenerDisconnected() {
        if (inst == this) inst = null;
        if (tts != null) tts.shutdown();
    }

    JSONObject settings() {
        try {
            SharedPreferences p = getSharedPreferences("jarvis", MODE_PRIVATE);
            return new JSONObject(p.getString("set", "{}"));
        } catch (Exception e) { return new JSONObject(); }
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            String pkg = sbn.getPackageName();
            String app = appName(pkg);
            if (app == null || pkg.equals(getPackageName())) return;
            Notification n = sbn.getNotification();
            if ((n.flags & Notification.FLAG_GROUP_SUMMARY) != 0) return;
            if ((n.flags & Notification.FLAG_ONGOING_EVENT) != 0) return;
            Bundle e = n.extras;
            CharSequence t = e.getCharSequence(Notification.EXTRA_TITLE);
            CharSequence x = e.getCharSequence(Notification.EXTRA_TEXT);
            if (t == null || x == null) return;
            String from = t.toString().trim(), text = x.toString().trim();
            if (text.isEmpty()) return;
            String sig = pkg + "|" + from + "|" + text;
            if (sig.equals(lastSig)) return;
            lastSig = sig;

            Msg m = new Msg();
            m.app = app; m.from = from; m.text = text; m.key = sbn.getKey(); m.time = System.currentTimeMillis();
            if (n.actions != null) for (Notification.Action a : n.actions) {
                RemoteInput[] ri = a.getRemoteInputs();
                if (ri != null && ri.length > 0) { m.reply = a; break; }
            }
            synchronized (list) { list.add(m); while (list.size() > 30) list.remove(0); }

            JSONObject o = new JSONObject();
            o.put("app", app); o.put("from", from); o.put("text", text); o.put("canReply", m.reply != null);
            MainActivity a = MainActivity.inst;
            if (a != null && MainActivity.visible) {
                a.js("J.onMessage(" + JSONObject.quote(o.toString()) + ")");
                return;
            }
            JSONObject s = settings();
            String mode = s.optString("readMsg", "always");
            boolean car = s.optBoolean("car", false);
            if ("off".equals(mode) || ("car".equals(mode) && !car)) return;
            say(app + ", " + from + " dan xabar: " + text);
        } catch (Exception ignored) {}
    }

    void say(String text) {
        if (!ttsOk) return;
        String t = text;
        Locale l = tts.getVoice() != null ? tts.getVoice().getLocale() : Locale.ROOT;
        if ("tr".equals(l.getLanguage())) {
            t = t.replace("sh", "ş").replace("Sh", "Ş").replace("ch", "ç").replace("Ch", "Ç")
                 .replace("o'", "o").replace("O'", "O").replace("g'", "g").replace("G'", "G")
                 .replace("o‘", "o").replace("g‘", "g").replace("x", "h").replace("X", "H")
                 .replace("q", "k").replace("Q", "K").replace("'", "");
        }
        if (t.length() > 400) t = t.substring(0, 400);
        tts.speak(t, TextToSpeech.QUEUE_ADD, null, "msg" + System.currentTimeMillis());
    }

    // ---------- Ilovadan chaqiriladi ----------
    static String recent(int n) {
        if (n <= 0) n = 30;
        JSONArray a = new JSONArray();
        synchronized (list) {
            for (int i = Math.max(0, list.size() - n); i < list.size(); i++) {
                Msg m = list.get(i);
                try {
                    JSONObject o = new JSONObject();
                    o.put("app", m.app); o.put("from", m.from); o.put("text", m.text);
                    o.put("ago", (System.currentTimeMillis() - m.time) / 60000);
                    o.put("time", m.time);
                    o.put("canReply", m.reply != null);
                    a.put(o);
                } catch (Exception ignored) {}
            }
        }
        return a.toString();
    }

    /** to — kimga (bo'sh bo'lsa oxirgi xabar egasiga). */
    static String reply(android.content.Context ctx, String to, String text) {
        Msg target = null;
        synchronized (list) {
            String t = to == null ? "" : to.toLowerCase(Locale.ROOT).trim();
            for (int i = list.size() - 1; i >= 0; i--) {
                Msg m = list.get(i);
                if (m.reply == null) continue;
                if (t.isEmpty() || m.from.toLowerCase(Locale.ROOT).contains(t) || t.contains(m.from.toLowerCase(Locale.ROOT))) { target = m; break; }
            }
        }
        if (target == null) return "none";
        try {
            Intent i = new Intent();
            Bundle b = new Bundle();
            for (RemoteInput r : target.reply.getRemoteInputs()) b.putCharSequence(r.getResultKey(), text);
            RemoteInput.addResultsToIntent(target.reply.getRemoteInputs(), i, b);
            target.reply.actionIntent.send(ctx, 0, i);
            return target.app + "|" + target.from;
        } catch (PendingIntent.CanceledException e) {
            return "expired";
        } catch (Exception e) {
            return "err";
        }
    }
}
