package uz.jarvis.app;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

/** "Jarvis Xabar" ilovasidan keladigan xabarlar va javob natijalari. */
public class MsgReceiver extends BroadcastReceiver {
    static final String XABAR = "uz.jarvis.xabar", PERM = "uz.jarvis.MSG";

    static SharedPreferences p(Context c) { return c.getSharedPreferences("jarvis", Context.MODE_PRIVATE); }

    static JSONArray all(Context c) {
        try { return new JSONArray(p(c).getString("msgs", "[]")); } catch (Exception e) { return new JSONArray(); }
    }

    @Override
    public void onReceive(Context c, Intent in) {
        String a = in.getAction();
        try {
            if ("uz.jarvis.MESSAGE".equals(a)) {
                JSONObject o = new JSONObject();
                o.put("app", in.getStringExtra("app"));
                o.put("from", in.getStringExtra("from"));
                o.put("text", in.getStringExtra("text"));
                o.put("time", in.getLongExtra("time", System.currentTimeMillis()));
                o.put("canReply", in.getBooleanExtra("canReply", false));
                JSONArray l = all(c), n = new JSONArray();
                for (int i = Math.max(0, l.length() - 29); i < l.length(); i++) n.put(l.get(i));
                n.put(o);
                p(c).edit().putString("msgs", n.toString()).apply();
                MainActivity m = MainActivity.inst;
                if (m != null && MainActivity.visible) {
                    m.js("J.onMessage(" + JSONObject.quote(o.toString()) + ")");
                    if (isOrderedBroadcast()) setResultCode(1);
                } else if (isOrderedBroadcast()) setResultCode(Activity.RESULT_CANCELED);
            } else if ("uz.jarvis.REPLY_RESULT".equals(a)) {
                MainActivity m = MainActivity.inst;
                if (m != null) m.js("J.onReplyResult(" + JSONObject.quote(String.valueOf(in.getStringExtra("result"))) + ")");
            }
        } catch (Exception ignored) {}
    }

    static String recent(Context c, int n) {
        JSONArray l = all(c), out = new JSONArray();
        long now = System.currentTimeMillis();
        try {
            for (int i = Math.max(0, l.length() - (n <= 0 ? 30 : n)); i < l.length(); i++) {
                JSONObject o = l.getJSONObject(i);
                o.put("ago", (now - o.optLong("time", now)) / 60000);
                out.put(o);
            }
        } catch (Exception ignored) {}
        return out.toString();
    }

    /** "sent" (yuborildi, natija keyin keladi), "none", "noapp". */
    static String reply(Context c, String to, String text) {
        if (!installed(c)) return "noapp";
        String t = to == null ? "" : to.toLowerCase().trim();
        JSONArray l = all(c);
        boolean found = false; String who = "";
        try {
            for (int i = l.length() - 1; i >= 0; i--) {
                JSONObject o = l.getJSONObject(i);
                if (!o.optBoolean("canReply")) continue;
                String f = o.optString("from").toLowerCase();
                if (t.isEmpty() || f.contains(t) || t.contains(f)) { found = true; who = o.optString("app") + "|" + o.optString("from"); break; }
            }
        } catch (Exception ignored) {}
        if (!found) return "none";
        c.sendBroadcast(new Intent("uz.jarvis.REPLY").setPackage(XABAR).putExtra("to", to).putExtra("text", text), PERM);
        return who;
    }

    static void settings(Context c, String readMsg, boolean car) {
        c.sendBroadcast(new Intent("uz.jarvis.SETTINGS").setPackage(XABAR).putExtra("readMsg", readMsg).putExtra("car", car), PERM);
    }

    static boolean installed(Context c) {
        try { c.getPackageManager().getPackageInfo(XABAR, 0); return true; } catch (Exception e) { return false; }
    }
}
