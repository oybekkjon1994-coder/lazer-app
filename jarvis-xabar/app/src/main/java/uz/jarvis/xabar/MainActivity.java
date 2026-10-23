package uz.jarvis.xabar;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Oddiy oyna: ruxsat holati va sozlash tugmalari. */
public class MainActivity extends Activity {
    TextView status;
    Button perm, open;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        l.setPadding(dp(24), dp(48), dp(24), dp(24));
        l.setBackgroundColor(0xFF05101A);

        TextView title = new TextView(this);
        title.setText("Jarvis Xabar");
        title.setTextColor(0xFF2FD8FF);
        title.setTextSize(24);
        title.setLetterSpacing(0.1f);
        l.addView(title);

        TextView info = new TextView(this);
        info.setText("Bu kichik yordamchi Telegram, WhatsApp, Instagram va SMS xabarlarini Jarvis'ga uzatadi. "
                + "Shunda Jarvis xabarlarni ovoz chiqarib o'qiydi va siz ovoz bilan javob qaytarasiz.\n\n"
                + "Bu ilovani ochib o'tirish shart emas — bir marta ruxsat bersangiz, o'zi ishlayveradi.");
        info.setTextColor(0xFFD9F6FF);
        info.setTextSize(15);
        info.setLineSpacing(0, 1.25f);
        info.setPadding(0, dp(16), 0, dp(24));
        l.addView(info);

        status = new TextView(this);
        status.setTextSize(17);
        status.setPadding(0, 0, 0, dp(16));
        l.addView(status);

        perm = btn("Xabarlarni o'qishga ruxsat berish", true);
        perm.setOnClickListener(v -> {
            try { startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)); }
            catch (Exception e) { startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, android.net.Uri.parse("package:" + getPackageName()))); }
        });
        l.addView(perm);

        open = btn("Jarvis'ni ochish", false);
        open.setOnClickListener(v -> {
            Intent i = getPackageManager().getLaunchIntentForPackage(Listener.JARVIS);
            if (i != null) startActivity(i);
        });
        l.addView(open);

        setContentView(l);
    }

    @Override
    protected void onResume() {
        super.onResume();
        String s = Settings.Secure.getString(getContentResolver(), "enabled_notification_listeners");
        boolean ok = s != null && s.contains(getPackageName());
        boolean jarvis;
        try { getPackageManager().getPackageInfo(Listener.JARVIS, 0); jarvis = true; }
        catch (PackageManager.NameNotFoundException e) { jarvis = false; }
        status.setText((ok ? "✓ Ruxsat berilgan — ishlayapti" : "✗ Ruxsat hali berilmagan")
                + (jarvis ? "" : "\n✗ Jarvis ilovasi o'rnatilmagan"));
        status.setTextColor(ok && jarvis ? 0xFF3EE08F : 0xFFFFB547);
        perm.setVisibility(ok ? android.view.View.GONE : android.view.View.VISIBLE);
        open.setVisibility(jarvis ? android.view.View.VISIBLE : android.view.View.GONE);
    }

    Button btn(String t, boolean main) {
        Button b = new Button(this);
        b.setText(t);
        b.setAllCaps(false);
        b.setTextSize(16);
        b.setTextColor(Color.WHITE);
        GradientDrawable g = new GradientDrawable();
        g.setCornerRadius(dp(12));
        g.setColor(main ? 0xFF1A8FB0 : 0xFF0D2231);
        if (!main) g.setStroke(dp(1), 0xFF163A50);
        b.setBackground(g);
        b.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, dp(52));
        lp.bottomMargin = dp(12);
        b.setLayoutParams(lp);
        return b;
    }

    int dp(int v) { return Math.round(v * getResources().getDisplayMetrics().density); }
}
