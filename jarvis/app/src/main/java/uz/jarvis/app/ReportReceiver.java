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

    static void schedule(Context c, boolean on, int hour, int min) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        Intent i = new Intent(c, ReportReceiver.class).putExtra("h", hour).putExtra("m", min);
        PendingIntent pi = PendingIntent.getBroadcast(c, ID, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
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
        int h = in.getIntExtra("h", 7), m = in.getIntExtra("m", 30);
        schedule(c, true, h, m); // ertangi kunga
        Intent open = new Intent(c, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                .putExtra("report", true);
        boolean can = Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(c);
        if (can) {
            try { c.startActivity(open); return; } catch (Exception ignored) {}
        }
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(new NotificationChannel("jarvis_report", "Ertalabki hisobot", NotificationManager.IMPORTANCE_HIGH));
            b = new Notification.Builder(c, "jarvis_report");
        } else b = new Notification.Builder(c);
        PendingIntent pi = PendingIntent.getActivity(c, 5, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        b.setSmallIcon(R.drawable.ic_n).setContentTitle("Xayrli tong! Jarvis hisoboti tayyor")
         .setContentText("Bosing — ob-havo, kurs va bugungi ishlarni aytib beraman").setAutoCancel(true).setContentIntent(pi);
        try { nm.notify(ID, b.build()); } catch (Exception ignored) {}
    }
}
