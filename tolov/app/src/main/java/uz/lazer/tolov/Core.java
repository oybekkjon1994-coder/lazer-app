package uz.lazer.tolov;

import android.content.Context;
import android.content.SharedPreferences;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/** Bank xabaridan to'lov summasini topib, imzolab, botga (ntfy orqali) yuboradi. */
public final class Core {
    private static final Map<String, Long> recent = new HashMap<>();

    public static SharedPreferences prefs(Context c) { return c.getSharedPreferences("tolov", Context.MODE_PRIVATE); }

    /** "LT1:topic:secret:price" sozlash kodini saqlaydi. */
    public static boolean setup(Context c, String code) {
        String[] p = code.trim().split(":");
        if (p.length < 3 || !p[0].equals("LT1")) return false;
        int price = 449000;
        try { if (p.length > 3) price = Integer.parseInt(p[3]); } catch (Exception ignored) {}
        prefs(c).edit().putString("topic", p[1]).putString("secret", p[2]).putInt("price", price).apply();
        return true;
    }

    public static boolean ready(Context c) { return prefs(c).getString("topic", null) != null; }

    /** Matndan price+1 .. price+99 oralig'idagi summalarni topadi. */
    public static List<Integer> amounts(String text, int price) {
        List<Integer> out = new ArrayList<>();
        if (text == null) return out;
        String t = text.replaceAll("(\\d)[\\s\\u00a0\\u202f.,'](?=\\d{3}\\b)", "$1");
        Matcher m = Pattern.compile("\\d{6,7}").matcher(t);
        while (m.find()) {
            try { int v = Integer.parseInt(m.group()); if (v > price && v < price + 100 && !out.contains(v)) out.add(v); } catch (Exception ignored) {}
        }
        return out;
    }

    public static void handle(Context c, String text, String source) {
        if (!ready(c)) return;
        SharedPreferences p = prefs(c);
        for (int a : amounts(text, p.getInt("price", 449000))) {
            synchronized (recent) {
                Long t = recent.get(a + source);
                if (t != null && System.currentTimeMillis() - t < 60000) continue;
                recent.put(a + source, System.currentTimeMillis());
            }
            send(c, a, source);
        }
    }

    public static void send(Context c, int amount, String source) {
        final SharedPreferences p = prefs(c);
        new Thread(() -> {
            String status;
            try {
                long ts = System.currentTimeMillis() / 1000;
                String body = amount + "|" + ts;
                Mac mac = Mac.getInstance("HmacSHA256");
                mac.init(new SecretKeySpec(p.getString("secret", "").getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
                StringBuilder sig = new StringBuilder();
                for (byte b : mac.doFinal(body.getBytes(StandardCharsets.UTF_8))) sig.append(String.format("%02x", b));
                String msg = "LT1|" + body + "|" + sig;
                HttpURLConnection h = (HttpURLConnection) new URL("https://ntfy.sh/" + p.getString("topic", "")).openConnection();
                h.setRequestMethod("POST"); h.setDoOutput(true); h.setConnectTimeout(15000); h.setReadTimeout(15000);
                try (OutputStream o = h.getOutputStream()) { o.write(msg.getBytes(StandardCharsets.UTF_8)); }
                int code = h.getResponseCode();
                status = (code == 200 ? "✅ Yuborildi: " : "❗ Xato " + code + ": ") + amount + " so'm (" + source + ")";
            } catch (Exception e) {
                status = "❗ Internet xatosi: " + amount + " so'm — " + e.getMessage();
            }
            String log = new java.text.SimpleDateFormat("dd.MM HH:mm").format(new java.util.Date()) + "  " + status + "\n" + p.getString("log", "");
            if (log.length() > 3000) log = log.substring(0, 3000);
            p.edit().putString("log", log).apply();
        }).start();
    }
}
