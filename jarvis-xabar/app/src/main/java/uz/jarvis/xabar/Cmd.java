package uz.jarvis.xabar;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Jarvis'dan buyruqlar: javob yuborish va sozlamalar. Faqat bir xil imzoli ilova yubora oladi. */
public class Cmd extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent in) {
        String a = in.getAction();
        if ("uz.jarvis.SETTINGS".equals(a)) {
            c.getSharedPreferences("x", Context.MODE_PRIVATE).edit()
                    .putString("readMsg", in.getStringExtra("readMsg") == null ? "always" : in.getStringExtra("readMsg"))
                    .putBoolean("car", in.getBooleanExtra("car", false))
                    .apply();
        } else if ("uz.jarvis.REPLY".equals(a)) {
            String r = Listener.inst == null ? "noaccess" : Listener.reply(c, in.getStringExtra("to"), in.getStringExtra("text"));
            c.sendBroadcast(new Intent("uz.jarvis.REPLY_RESULT").setPackage(Listener.JARVIS)
                    .putExtra("result", r).putExtra("text", in.getStringExtra("text")), Listener.PERM);
        }
    }
}
