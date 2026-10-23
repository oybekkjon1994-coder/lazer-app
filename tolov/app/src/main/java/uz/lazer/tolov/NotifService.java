package uz.lazer.tolov;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

public class NotifService extends NotificationListenerService {
    @Override public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            if (sbn.getPackageName().equals(getPackageName())) return;
            Bundle e = sbn.getNotification().extras;
            StringBuilder s = new StringBuilder();
            for (String k : new String[]{Notification.EXTRA_TITLE, Notification.EXTRA_TEXT, Notification.EXTRA_BIG_TEXT, Notification.EXTRA_SUB_TEXT}) {
                CharSequence v = e.getCharSequence(k); if (v != null) s.append(v).append(' ');
            }
            Core.handle(this, s.toString(), sbn.getPackageName());
        } catch (Exception ignored) {}
    }
}
