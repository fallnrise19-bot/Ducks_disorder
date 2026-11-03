package ca.creativepixels.ducksdisorder;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class ReminderReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        if (ReminderScheduler.ACTION_REMINDER.equals(intent.getAction())) {
            ReminderScheduler.deliver(context, intent.getIntExtra("reminder_id", -1));
        } else {
            // Restore the user's reminders after reboot, timezone change, or an app update.
            ReminderScheduler.scheduleAll(context);
        }
    }
}