package uz.jarvis.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.wifi.WifiManager;
import android.os.Build;

import org.json.JSONObject;

import java.lang.reflect.Method;

/** Mashinani aniqlash: telefon zaryadga ulandi + Wi-Fi tarmog'iga ulanmagan + modem (точка доступа) yoqiq => mashina rejimi. */
public class CarDetect extends BroadcastReceiver {
    static long last = 0;
    static String lastAct = "";

    static IntentFilter filter() {
        IntentFilter f = new IntentFilter();
        f.addAction(Intent.ACTION_POWER_CONNECTED);
        f.addAction(Intent.ACTION_POWER_DISCONNECTED);
        return f;
    }

    static void register(Context c, BroadcastReceiver r) {
        try {
            if (Build.VERSION.SDK_INT >= 33) c.registerReceiver(r, filter(), Context.RECEIVER_EXPORTED);
            else c.registerReceiver(r, filter());
        } catch (Exception ignored) {}
    }

    static boolean enabled(Context c) {
        try { return new JSONObject(c.getSharedPreferences("jarvis", Context.MODE_PRIVATE).getString("set", "{}")).optBoolean("carAuto", true); }
        catch (Exception e) { return true; }
    }

    static boolean onWifiClient(Context c) {
        try {
            ConnectivityManager cm = (ConnectivityManager) c.getSystemService(Context.CONNECTIVITY_SERVICE);
            Network n = cm.getActiveNetwork();
            NetworkCapabilities nc = n == null ? null : cm.getNetworkCapabilities(n);
            return nc != null && nc.hasTransport(NetworkCapabilities.TRANSPORT_WIFI);
        } catch (Exception e) { return false; }
    }

    static boolean hotspotOn(Context c) {
        try {
            WifiManager w = (WifiManager) c.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            Method m = w.getClass().getDeclaredMethod("isWifiApEnabled");
            m.setAccessible(true);
            return (Boolean) m.invoke(w);
        } catch (Exception e) { return true; } // bilib bo'lmasa — faqat Wi-Fi'siz zaryadga qaraymiz
    }

    @Override
    public void onReceive(Context c, Intent in) {
        String a = in.getAction();
        boolean on = Intent.ACTION_POWER_CONNECTED.equals(a);
        long now = System.currentTimeMillis();
        if (a == null || (a.equals(lastAct) && now - last < 3000)) return; // ilova va xizmat ikkalasi ham eshitadi
        last = now; lastAct = a;
        if (!enabled(c)) return;
        if (on && (onWifiClient(c) || !hotspotOn(c))) return; // uyda/ustaxonada (Wi-Fi) zaryadlanyapti — mashina emas
        MainActivity m = MainActivity.inst;
        if (m != null) { m.js("J.autoCar && J.autoCar(" + on + ")"); return; }
        if (on) {
            Intent i = new Intent(c, MainActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            i.putExtra("car", true);
            try { c.startActivity(i); } catch (Exception ignored) {}
        }
    }
}
