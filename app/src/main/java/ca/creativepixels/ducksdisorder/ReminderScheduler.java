package ca.creativepixels.ducksdisorder;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import java.util.Calendar;

final class ReminderScheduler {
    static final String CHANNEL_ID = "ducks_life_reminders";
    static final String ACTION_REMINDER = "ca.creativepixels.ducksdisorder.LIFE_REMINDER";
    private static final String PREFS = "ducks_notifications";
    private static final String ENABLED = "enabled";
    private static final int DAILY = 0;
    private static final int[] IDS = {101, 102, 103, 201, 202, 301, 401, 402};
    private static final String[] TITLES = {
        "A little water break 💧", "Time for some water 💧", "Water check-in 💧",
        "Have you eaten something?", "A little food break 🍽️",
        "Dishwasher check-in", "Sunday laundry 🧺", "Tuesday night garbage 🗑️"
    };
    private static final String[] TEXTS = {
        "A few sips count. You can earn Duck Coins in Daily Life.",
        "Have some water when you get a chance.",
        "Take a moment for a drink if you need one.",
        "A meal or something nourishing is worth making time for.",
        "Remember to eat something this evening.",
        "Run or empty the dishwasher when you're ready.",
        "Your Sunday laundry routine is here.",
        "Remember to put the garbage out tonight."
    };
    private static final int[] DAYS = {DAILY, DAILY, DAILY, DAILY, DAILY, DAILY,
            Calendar.SUNDAY, Calendar.TUESDAY};
    private static final int[] HOURS = {12, 16, 20, 13, 18, 21, 13, 19};
    private static final int[] MINUTES = {0, 0, 0, 0, 0, 0, 0, 0};

    private ReminderScheduler() {}

    static boolean isConfigured(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(ENABLED, false);
    }

    static boolean isEnabled(Context ctx) {
        NotificationManager manager = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        return isConfigured(ctx) && manager != null && manager.areNotificationsEnabled();
    }

    static void createChannel(Context ctx) {
        NotificationManager manager = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null && Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID,
                    "Daily life reminders", NotificationManager.IMPORTANCE_DEFAULT);
            channel.setDescription("Gentle water, meal, and household routine reminders");
            manager.createNotificationChannel(channel);
        }
    }

    static void enable(Context ctx) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(ENABLED, true).apply();
        createChannel(ctx);
        scheduleAll(ctx);
    }

    static void disable(Context ctx) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(ENABLED, false).apply();
        AlarmManager alarm = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (alarm != null) {
            for (int id : IDS) alarm.cancel(pending(ctx, id));
        }
    }

    static void scheduleAll(Context ctx) {
        if (!isConfigured(ctx)) return;
        for (int id : IDS) scheduleNext(ctx, id);
    }

    static void scheduleNext(Context ctx, int id) {
        if (!isConfigured(ctx)) return;
        int i = locate(id);
        if (i < 0) return;
        Calendar now = Calendar.getInstance();
        Calendar next = Calendar.getInstance();
        next.set(Calendar.HOUR_OF_DAY, HOURS[i]);
        next.set(Calendar.MINUTE, MINUTES[i]);
        next.set(Calendar.SECOND, 0);
        next.set(Calendar.MILLISECOND, 0);
        if (DAYS[i] != DAILY) {
            int offset = (DAYS[i] - now.get(Calendar.DAY_OF_WEEK) + 7) % 7;
            if (offset > 0) next.add(Calendar.DAY_OF_YEAR, offset);
            if (!next.after(now)) next.add(Calendar.DAY_OF_YEAR, 7);
        } else if (!next.after(now)) {
            next.add(Calendar.DAY_OF_YEAR, 1);
        }
        AlarmManager alarm = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (alarm != null) {
            // Inexact alarms avoid special exact-alarm permission and may arrive slightly late.
            alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), pending(ctx, id));
        }
    }

    static void deliver(Context ctx, int id) {
        if (!isConfigured(ctx)) return;
        int i = locate(id);
        if (i < 0) return;
        createChannel(ctx);
        if (isEnabled(ctx)) {
            Intent open = new Intent(ctx, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            open.putExtra("open_life", true);
            PendingIntent tap = PendingIntent.getActivity(ctx, id, open,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            Notification notification = new Notification.Builder(ctx, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_dialog_info)
                    .setContentTitle(TITLES[i])
                    .setContentText(TEXTS[i])
                    .setColor(Color.rgb(135, 178, 144))
                    .setAutoCancel(true)
                    .setContentIntent(tap)
                    .build();
            NotificationManager manager =
                    (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) manager.notify(id, notification);
        }
        scheduleNext(ctx, id);
    }

    private static int locate(int id) {
        for (int i = 0; i < IDS.length; i++) if (IDS[i] == id) return i;
        return -1;
    }

    private static PendingIntent pending(Context ctx, int id) {
        Intent intent = new Intent(ctx, ReminderReceiver.class);
        intent.setAction(ACTION_REMINDER);
        intent.putExtra("reminder_id", id);
        return PendingIntent.getBroadcast(ctx, id, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}