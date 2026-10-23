package uz.jarvis.app;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;

import java.util.Calendar;

/** Har kuni belgilangan vaqtda ertalabki hisobotni ishga tushiradi. */
public class ReportReceiver extends BroadcastReceiver {
    static final int ID = 9001;

    static void schedule(Context c, boolean on, int hour, int min) { schedule(c, on, hour, min, "morning"); }

    static void schedule(Context c, boolean on, int hour, int min, String kind) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        int id = "evening".equals(kind) ? ID + 1 : ID;
        Intent i = new Intent(c, ReportReceiver.class).putExtra("h", hour).putExtra("m", min).putExtra("kind", kind);
        PendingIntent pi = PendingIntent.getBroadcast(c, id, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        am.cancel(pi);
        if (!on) return;
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, hour);
        cal.set(Calendar.MINUTE, min);
        cal.set(Calendar.SECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis() + 30000) cal.add(Calendar.DAY_OF_YEAR, 1);
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
    }

    @Override
    public void onReceive(Context c, Intent in) {
        String kind = in.getStringExtra("kind"); if (kind == null) kind = "morning";
        boolean eve = "evening".equals(kind);
        int h = in.getIntExtra("h", eve ? 21 : 7), m = in.getIntExtra("m", eve ? 0 : 30);
        schedule(c, true, h, m, kind); // ertangi kunga
        Intent open = new Intent(c, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                .putExtra(eve ? "evening" : "report", true);
        boolean can = Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(c);
        if (can) {
            try { c.startActivity(open); return; } catch (Exception ignored) {}
        }
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(new NotificationChannel("jarvis_report", "Jarvis hisobotlari", NotificationManager.IMPORTANCE_HIGH));
            b = new Notification.Builder(c, "jarvis_report");
        } else b = new Notification.Builder(c);
        PendingIntent pi = PendingIntent.getActivity(c, 5, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        b.setSmallIcon(R.drawable.ic_n).setContentTitle(eve ? "Kun yakuni — Jarvis xulosasi tayyor" : "Xayrli tong! Jarvis hisoboti tayyor")
         .setContentText(eve ? "Bosing — bugungi ishlar, xarajatlar va ertangi rejani aytib beraman" : "Bosing — ob-havo, kurs va bugungi ishlarni aytib beraman").setAutoCancel(true).setContentIntent(pi);
        try { nm.notify(eve ? ID + 1 : ID, b.build()); } catch (Exception ignored) {}
    }
}
