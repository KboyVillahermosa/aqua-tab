# Expo Go Compatible Notification System

## Overview

This application uses a **100% Expo Go compatible** notification system that works without requiring EAS build, native modules, push tokens, or background tasks.

## Architecture

### Core Components

1. **notificationManager.ts** - Unified notification service

   - Location: `app/services/notificationManager.ts`
   - Singleton instance managing all notifications
   - Handles in-app timers, toast messages, and alerts

2. **react-native-toast-message** - Toast notifications

   - Displays non-intrusive notifications at top of screen
   - Configurable duration, colors, and actions
   - Works in Expo Go without any configuration

3. **React Native Alert** - System dialogs
   - Used for critical warnings and confirmations
   - Native system alert dialogs
   - Always available in Expo Go

### Key Features

#### ✅ What Works in Expo Go

- **In-App Toast Notifications**: Visible when app is open
- **Alert Dialogs**: System-style popups for critical messages
- **JavaScript Timers**: setInterval/setTimeout for reminders while app is active
- **AppState Listeners**: Detect when app is resumed and check for missed reminders
- **Custom Modals**: Rich notification content with animations
- **AsyncStorage Persistence**: Store reminder info for resume checks

#### ❌ What's NOT Used (Requires EAS Build)

- ~~Expo Push Notifications~~
- ~~Background Tasks~~
- ~~Scheduled Notifications (native)~~
- ~~Push Tokens~~
- ~~Notification Channels~~
- ~~Badge Updates~~

## Notification Types

### 1. Hydration Notifications

**showHydrationReminder(amountMl, currentTotal, goal)**

- Reminds user to drink water
- Shows remaining amount for the day
- Throttled to max once per 2 hours

**showOverhydrationWarning(percentage, amount)**

- Critical alerts for over-hydration (>130%, >150%, >200%)
- Alert dialog for immediate attention
- Severity escalates with percentage

**showBehindPaceAlert(remaining)**

- Notifies when user is behind schedule
- Shows ml remaining to reach goal
- Max once per 4 hours

**showGoalCompletionAlert(goalType, goalValue)**

- Success toast when daily goal is reached
- Celebration animation in UI
- One-time per goal completion

### 2. Medication Notifications

**showMedicationReminder(medicationName, dosage, time)**

- Alert dialog for medication times
- Includes medication name, dosage, and scheduled time
- High priority notification

**Snooze Functionality**

- Reschedules medication reminder
- Default: 15 minutes
- Shows confirmation toast

### 3. System Notifications

**showMissedLogReminder(type)**

- Confirms missed reminder was logged
- Low priority toast
- Auto-dismisses after 3 seconds

**showDailySummary(stats)**

- Shows hydration and medication stats
- Displays once per day
- 6-second duration toast

**showStreakMilestone(days)**

- Celebrates consecutive days streak
- Success toast with fire emoji
- 5-second duration

**showCustomNotification(title, message, type, priority)**

- Generic notification method
- Supports both toast and alert
- Configurable priority levels

## Reminder Scheduling

### In-App Timer System

Since Expo Go doesn't support background tasks, reminders use JavaScript timers:

```typescript
// Hydration reminder - repeating
notificationManager.scheduleHydrationReminder(
  120, // interval in minutes
  () => {
    // Callback triggered every 2 hours while app is open
    notificationManager.showHydrationReminder(250, currentTotal, goal);
  }
);

// Medication reminder - one-time
notificationManager.scheduleMedicationReminder(
  targetDateTime, // specific Date object
  () => {
    // Callback triggered at specific time
    notificationManager.showMedicationReminder(name, dosage, time);
  }
);
```

### Resume Detection

When app is resumed (opened after being backgrounded):

1. **AppState listener** detects 'active' state
2. **checkPendingReminders()** reads stored reminder info from AsyncStorage
3. **Compares** last trigger time with current time
4. **Shows** missed notifications if appropriate
5. **Reschedules** upcoming reminders

### Cancellation

```typescript
// Cancel specific reminder
notificationManager.cancelReminder(reminderId);

// Cancel all of one type
notificationManager.cancelAllReminders("hydration");
notificationManager.cancelAllReminders("medication");

// Cancel everything
notificationManager.cleanup();
```

## Implementation Guide

### Step 1: Initialize in Root Layout

```tsx
// app/_layout.tsx
import { notificationManager } from "./services/notificationManager";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  useEffect(() => {
    notificationManager.initialize();
    return () => notificationManager.cleanup();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </>
  );
}
```

### Step 2: Use in Components

```tsx
// Any screen
import { notificationManager } from "../services/notificationManager";

function MyScreen() {
  // Show hydration reminder
  const remindToHydrate = () => {
    notificationManager.showHydrationReminder(250, 1500, 2000);
  };

  // Schedule repeating reminder
  useEffect(() => {
    const id = notificationManager.scheduleHydrationReminder(120, () => {
      notificationManager.showHydrationReminder(250, totalToday(), goal);
    });

    return () => notificationManager.cancelReminder(id);
  }, []);

  // Show medication reminder
  const remindMedication = () => {
    notificationManager.showMedicationReminder("Aspirin", "100mg", "8:00 AM");
  };

  // Show custom notification
  const showCustom = () => {
    notificationManager.showCustomNotification(
      "Custom Title",
      "Custom message here",
      "toast", // or 'alert'
      "medium" // 'low' | 'medium' | 'high' | 'critical'
    );
  };
}
```

### Step 3: Customize Toast Appearance

```tsx
// Create custom toast config (optional)
import Toast, { BaseToast } from "react-native-toast-message";

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#10B981" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: "600" }}
      text2Style={{ fontSize: 14 }}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#EF4444" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: "600" }}
      text2Style={{ fontSize: 14 }}
    />
  ),
};

// In app layout
<Toast config={toastConfig} />;
```

## Priority Levels

| Priority     | Use Case                    | Display Method | Duration       |
| ------------ | --------------------------- | -------------- | -------------- |
| **low**      | Confirmations, info         | Toast (gray)   | 3-4 seconds    |
| **medium**   | Reminders, updates          | Toast (blue)   | 4-5 seconds    |
| **high**     | Warnings, medications       | Alert dialog   | User dismisses |
| **critical** | Over-hydration, emergencies | Alert dialog   | User dismisses |

## Throttling System

Prevents notification spam by tracking last notification time per type:

- **Hydration reminders**: Max once per 2 hours
- **Behind pace alerts**: Max once per 4 hours
- **Over-hydration warnings**: No throttle (immediate)
- **Medication reminders**: No throttle (time-critical)
- **Custom notifications**: No automatic throttle

## Limitations

### What Happens When App is Closed

- **Timers stop**: JavaScript timers don't run when app is closed
- **Resume detection**: On next app open, checks for missed reminders
- **Late notifications**: Shows "you missed X reminder" when app reopens
- **No push**: Cannot receive notifications while app is fully closed

### Workarounds

1. **Encourage app to stay open**: Use background audio (requires specific setup)
2. **Frequent app usage**: App is more effective with regular opens
3. **System alarms**: Use device's built-in alarm for critical medications
4. **Web notifications**: For desktop/PWA version (future enhancement)

## Migration from Native Notifications

If you had code using Expo Notifications:

### Before (Native)

```typescript
import * as Notifications from "expo-notifications";

await Notifications.scheduleNotificationAsync({
  content: {
    title: "Reminder",
    body: "Drink water!",
  },
  trigger: { seconds: 7200 },
});
```

### After (Expo Go Compatible)

```typescript
import { notificationManager } from "./services/notificationManager";

notificationManager.scheduleHydrationReminder(120, () => {
  notificationManager.showHydrationReminder(250, 1500, 2000);
});
```

## Testing Checklist

- [ ] Toast appears when app is open
- [ ] Alerts show for critical notifications
- [ ] Timers trigger callbacks at correct intervals
- [ ] App resume triggers missed reminder checks
- [ ] Cancel operations clear timers properly
- [ ] Throttling prevents spam
- [ ] AsyncStorage persists reminder info
- [ ] Multiple reminders don't conflict
- [ ] UI remains responsive during notifications
- [ ] Works on both iOS and Android in Expo Go

## Troubleshooting

### Toast Not Appearing

- Verify `<Toast />` component is in root layout
- Check z-index conflicts with modals
- Ensure `topOffset` is appropriate for your layout

### Timers Not Firing

- Check app stays in foreground
- Verify callbacks are not crashing
- Look for timer ID conflicts

### Resume Detection Not Working

- Confirm AppState listener is initialized
- Check AsyncStorage permissions
- Verify reminder info is being stored

### Performance Issues

- Limit active timers (max 5-10 concurrent)
- Clear old reminders regularly
- Use throttling for frequent operations

## Future Enhancements

Potential improvements that still maintain Expo Go compatibility:

1. **Visual notification badges** - Custom UI badges on nav buttons
2. **In-app notification center** - History of all notifications
3. **Sound effects** - Audio.Sound API for reminder chimes
4. **Haptic feedback** - Vibration on critical notifications
5. **Notification preferences** - Per-type enable/disable
6. **Time-based muting** - Quiet hours feature
7. **Notification grouping** - Combine similar notifications
8. **Action buttons** - Quick actions from toasts

## Support

For issues or questions:

1. Check this documentation
2. Review `app/services/notificationManager.ts` source code
3. Test in Expo Go on actual device (not just simulator)
4. Verify all dependencies are installed: `npm install react-native-toast-message`

## Version Info

- **React Native**: 0.76.5
- **Expo SDK**: ~52.0.11
- **react-native-toast-message**: Latest
- **Notification System**: v2.0 (Expo Go Compatible)
