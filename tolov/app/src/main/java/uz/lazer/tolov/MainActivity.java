package uz.lazer.tolov;

import android.app.Activity;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private TextView status, log;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (18 * getResources().getDisplayMetrics().density);
        l.setPadding(pad, pad, pad, pad);
        l.setBackgroundColor(Color.parseColor("#141414"));

        TextView h = text("Lazer To'lov", 26, "#FFD400"); l.addView(h);
        l.addView(text("Kartangizga to'lov tushganda bank xabaridan faqat summani olib, botga yuboradi. Bot kalitni xaridorga o'zi beradi.", 14, "#BBBBBB"));
        status = text("", 16, "#FFFFFF"); status.setPadding(0, pad, 0, pad); l.addView(status);

        l.addView(text("1. Sozlash kodi (botga /tolovsozla yozing va kodni shu yerga qo'ying):", 14, "#FFFFFF"));
        final EditText code = new EditText(this); code.setTextColor(Color.WHITE); code.setHint("LT1:..."); code.setHintTextColor(Color.GRAY); l.addView(code);
        Button paste = btn("Nusxalanganini qo'yish"); paste.setOnClickListener(v -> {
            ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            if (cm.getPrimaryClip() != null && cm.getPrimaryClip().getItemCount() > 0) code.setText(cm.getPrimaryClip().getItemAt(0).coerceToText(this));
        }); l.addView(paste);
        Button save = btn("Saqlash"); save.setOnClickListener(v -> {
            Toast.makeText(this, Core.setup(this, code.getText().toString()) ? "Saqlandi ✅" : "Kod noto'g'ri", Toast.LENGTH_LONG).show(); refresh();
        }); l.addView(save);

        l.addView(text("2. Bildirishnomalarni o'qishga ruxsat (Click, Payme, bank ilovalari uchun):", 14, "#FFFFFF"));
        Button nb = btn("Ruxsat berish → «Lazer To'lov»ni yoqing"); nb.setOnClickListener(v -> startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))); l.addView(nb);


        l.addView(text("4. Tekshirish:", 14, "#FFFFFF"));
        Button tb = btn("Sinov xabari yuborish"); tb.setOnClickListener(v -> {
            if (!Core.ready(this)) { Toast.makeText(this, "Avval sozlash kodini saqlang", Toast.LENGTH_LONG).show(); return; }
            Core.send(this, Core.prefs(this).getInt("price", 449000) + 99, "sinov");
            Toast.makeText(this, "Yuborildi — botda «sinov» xabari chiqadi", Toast.LENGTH_LONG).show();
            status.postDelayed(this::refresh, 3000);
        }); l.addView(tb);

        log = text("", 13, "#9FE29F"); log.setPadding(0, pad, 0, 0); l.addView(log);
        ScrollView sv = new ScrollView(this); sv.addView(l); setContentView(sv);
    }

    @Override protected void onResume() { super.onResume(); refresh(); }

    private void refresh() {
        String en = Settings.Secure.getString(getContentResolver(), "enabled_notification_listeners");
        boolean notif = en != null && en.contains(getPackageName());
        boolean sms = false;
        status.setText((Core.ready(this) ? "✅ Sozlangan" : "❗ Sozlash kodi kiritilmagan") + "\n" +
            (notif ? "✅ Bildirishnomalar o'qiladi" : "❗ Bildirishnomaga ruxsat yo'q") + "\n" +
            "");
        log.setText("Oxirgi yuborilganlar:\n" + Core.prefs(this).getString("log", "hali yo'q"));
    }

    private TextView text(String s, int sp, String color) { TextView t = new TextView(this); t.setText(s); t.setTextSize(sp); t.setTextColor(Color.parseColor(color)); t.setPadding(0, 8, 0, 8); return t; }
    private Button btn(String s) { Button b = new Button(this); b.setText(s); b.setAllCaps(false); b.setGravity(Gravity.CENTER); return b; }
}
