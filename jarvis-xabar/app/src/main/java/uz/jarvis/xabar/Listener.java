package uz.jarvis.xabar;

import android.app.Activity;
import android.app.Notification;
import android.app.PendingIntent;
import android.app.RemoteInput;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.speech.tts.TextToSpeech;

import java.util.ArrayList;
import java.util.Locale;

/** Telegram / WhatsApp / Instagram / SMS xabarlarini ushlab, Jarvis'ga uzatadi. */
public class Listener extends NotificationListenerService {
    static final String JARVIS = "uz.jarvis.yordamchi";
    static final String PERM = "uz.jarvis.MSG";

    static class Msg { String app, from, text; long time; Notification.Action reply; }
    static final ArrayList<Msg> list = new ArrayList<>();
    static Listener inst;

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
            if (s != TextToSpeech.SUCCESS) return;
            ttsOk = true;
            for (String t : new String[]{"uz-UZ", "tr-TR", "ru-RU"}) {
                Locale l = Locale.forLanguageTag(t);
                if (tts.isLanguageAvailable(l) >= TextToSpeech.LANG_AVAILABLE) { tts.setLanguage(l); break; }
            }
            tts.setPitch(0.85f);
        });
    }

    @Override
    public void onListenerDisconnected() {
        if (inst == this) inst = null;
        if (tts != null) tts.shutdown();
    }

    SharedPreferences prefs() { return getSharedPreferences("x", MODE_PRIVATE); }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            String pkg = sbn.getPackageName();
            String app = appName(pkg);
            if (app == null) return;
            Notification n = sbn.getNotification();
            if ((n.flags & Notification.FLAG_GROUP_SUMMARY) != 0 || (n.flags & Notification.FLAG_ONGOING_EVENT) != 0) return;
            Bundle e = n.extras;
            if (isGroup(n, e)) return; // faqat shaxsiy xabarlar: guruh va kanallar o'tkazib yuboriladi
            CharSequence t = e.getCharSequence(Notification.EXTRA_TITLE), x = e.getCharSequence(Notification.EXTRA_TEXT);
            if (t == null || x == null) return;
            String from = t.toString().trim(), text = x.toString().trim();
            if (text.isEmpty()) return;
            String sig = pkg + "|" + from + "|" + text;
            if (sig.equals(lastSig)) return;
            lastSig = sig;

            Msg m = new Msg();
            m.app = app; m.from = from; m.text = text; m.time = System.currentTimeMillis();
            if (n.actions != null) for (Notification.Action a : n.actions) {
                RemoteInput[] ri = a.getRemoteInputs();
                if (ri != null && ri.length > 0) { m.reply = a; break; }
            }
            synchronized (list) { list.add(m); while (list.size() > 30) list.remove(0); }

            Intent i = new Intent("uz.jarvis.MESSAGE").setPackage(JARVIS)
                    .putExtra("app", app).putExtra("from", from).putExtra("text", text)
                    .putExtra("time", m.time).putExtra("canReply", m.reply != null);
            final String line = app + ", " + from + " dan xabar: " + text;
            // Jarvis ochiq bo'lsa o'zi o'qiydi (natija = 1); aks holda shu yerda o'qiymiz
            sendOrderedBroadcast(i, PERM, new BroadcastReceiver() {
                @Override public void onReceive(Context c, Intent r) {
                    if (getResultCode() == 1) return;
                    String mode = prefs().getString("readMsg", "always");
                    boolean car = prefs().getBoolean("car", false);
                    if ("off".equals(mode) || ("car".equals(mode) && !car)) return;
                    say(line);
                }
            }, null, Activity.RESULT_CANCELED, null, null);
        } catch (Exception ignored) {}
    }

    /** Guruh, kanal yoki ommaviy tarqatma xabarimi? */
    static boolean isGroup(Notification n, Bundle e) {
        try {
            if (android.os.Build.VERSION.SDK_INT >= 28 && e.getBoolean(Notification.EXTRA_IS_GROUP_CONVERSATION, false)) return true;
            CharSequence ct = e.getCharSequence(Notification.EXTRA_CONVERSATION_TITLE);
            if (ct != null && ct.length() > 0) return true;
            String ch = android.os.Build.VERSION.SDK_INT >= 26 && n.getChannelId() != null ? n.getChannelId().toLowerCase(Locale.ROOT) : "";
            if (ch.contains("group") || ch.contains("channel") || ch.contains("kanal") || ch.contains("broadcast")) return true;
            String sid = android.os.Build.VERSION.SDK_INT >= 29 && n.getShortcutId() != null ? n.getShortcutId() : "";
            if (sid.contains("@g.us") || sid.contains("@newsletter") || sid.contains("@broadcast") || sid.startsWith("ndid_-")) return true;
        } catch (Exception ignored) {}
        return false;
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
        tts.speak(t, TextToSpeech.QUEUE_ADD, null, "m" + System.currentTimeMillis());
    }

    /** Javob yuborish. Natija: "App|Kimga", "none", "expired", "err". */
    static String reply(Context ctx, String to, String text) {
        Msg target = null;
        String t = to == null ? "" : to.toLowerCase(Locale.ROOT).trim();
        synchronized (list) {
            for (int i = list.size() - 1; i >= 0; i--) {
                Msg m = list.get(i);
                if (m.reply == null) continue;
                String f = m.from.toLowerCase(Locale.ROOT);
                if (t.isEmpty() || f.contains(t) || t.contains(f)) { target = m; break; }
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
