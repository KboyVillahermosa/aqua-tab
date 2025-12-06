# Notification Manager - Quick Reference

## Installation

```bash
npm install react-native-toast-message
```

## Setup (Already Done)

**Root Layout** (`app/_layout.tsx`):

```tsx
import Toast from "react-native-toast-message";
import { notificationManager } from "./services/notificationManager";

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

## Usage in Components

### Import

```tsx
import { notificationManager } from "../../services/notificationManager";
```

## API Reference

### Hydration Methods

```typescript
// Show reminder to drink water
notificationManager.showHydrationReminder(
  amountMl: number,      // e.g., 250
  currentTotal: number,  // e.g., 1500
  goal: number          // e.g., 2000
);
// Shows: "💧 Time to Hydrate! Drink 250ml. 500ml remaining"

// Show warning for over-hydration
notificationManager.showOverhydrationWarning(
  percentage: number,    // e.g., 135
  amount: number        // e.g., 2700
);
// Severity auto-adjusts: 110% (caution) → 150% (extreme) → 200% (critical)

// Show behind schedule alert
notificationManager.showBehindPaceAlert(
  remaining: number     // e.g., 500 ml remaining
);
// Shows: "⚡ Stay on Track! Drink 500ml more today"

// Show goal completion
notificationManager.showGoalCompletionAlert(
  goalType: 'hydration' | 'medication',
  goalValue: number | string  // e.g., 2000 or "Aspirin"
);
```

### Medication Methods

```typescript
// Show medication reminder
notificationManager.showMedicationReminder(
  medicationName: string,  // e.g., "Aspirin"
  dosage: string,         // e.g., "100mg"
  time: string            // e.g., "8:00 AM"
);
// Shows as system alert dialog

// Show missed reminder log confirmation
notificationManager.showMissedLogReminder(
  type: 'hydration' | 'medication'
);
```

### General Methods

```typescript
// Show daily summary
notificationManager.showDailySummary({
  hydrationPercentage: 85,    // 0-200+
  hydrationTotal: 1700,       // ml
  medicationsTaken: 2,        // count
  medicationsTotal: 3         // count
});

// Show streak milestone
notificationManager.showStreakMilestone(
  days: number  // e.g., 7
);
// Shows: "🔥 Streak Milestone! 7 days!"

// Custom notification
notificationManager.showCustomNotification(
  title: string,
  message: string,
  type: 'toast' | 'alert',     // default: 'toast'
  priority: 'low' | 'medium' | 'high' | 'critical'  // default: 'medium'
);
```

## Reminder Scheduling

### Hydration Reminders (Repeating)

```typescript
useEffect(() => {
  // Schedule reminder every 2 hours
  const reminderId = notificationManager.scheduleHydrationReminder(
    120, // minutes between reminders
    () => {
      // This callback runs every 2 hours while app is open
      notificationManager.showHydrationReminder(
        Math.round(goal / 8), // suggest 1/8 of goal
        totalToday(), // current amount
        goal // daily goal
      );
    }
  );

  // Cleanup when component unmounts
  return () => {
    notificationManager.cancelReminder(reminderId);
  };
}, [goal]);
```

### Medication Reminders (One-Time)

```typescript
// Schedule reminder for specific time
const targetTime = new Date();
targetTime.setHours(8, 0, 0); // 8:00 AM

const reminderId = notificationManager.scheduleMedicationReminder(
  targetTime,
  () => {
    notificationManager.showMedicationReminder(
      "Aspirin",
      "100mg",
      targetTime.toLocaleTimeString()
    );
  }
);
```

## Cancellation

```typescript
// Cancel specific reminder
notificationManager.cancelReminder(reminderId);

// Cancel all hydration reminders
notificationManager.cancelAllReminders("hydration");

// Cancel all medication reminders
notificationManager.cancelAllReminders("medication");

// Cancel everything (usually in cleanup)
notificationManager.cancelAllReminders();
notificationManager.cleanup();
```

## Priority & Duration

### Toast Notification Durations

| Priority     | Duration    | Color  | Use Case                  |
| ------------ | ----------- | ------ | ------------------------- |
| **low**      | 3 seconds   | Gray   | Info, confirmations       |
| **medium**   | 4-5 seconds | Blue   | Reminders, updates        |
| **high**     | 5-6 seconds | Orange | Warnings                  |
| **critical** | 6+ seconds  | Red    | Emergencies (often alert) |

### Priority Examples

```typescript
// Low priority - auto-dismiss quickly
notificationManager.showCustomNotification(
  "Saved",
  "Entry saved successfully",
  "toast",
  "low" // 3 seconds
);

// Critical priority - user must acknowledge
notificationManager.showCustomNotification(
  "Emergency",
  "Critical health warning!",
  "alert", // System dialog
  "critical"
);
```

## Throttling

Prevents notification spam:

| Event                  | Max Frequency            |
| ---------------------- | ------------------------ |
| Hydration reminder     | Once per 2 hours         |
| Behind pace alert      | Once per 4 hours         |
| Over-hydration warning | No limit (immediate)     |
| Medication reminder    | No limit (time-critical) |
| Custom notifications   | No limit                 |

## Resume Detection

Automatically handles app resumption:

```typescript
// No code needed - automatically handled!
// When app is resumed:
// 1. AppState listener detects 'active'
// 2. checkPendingReminders() checks stored info
// 3. Shows missed notifications if needed
// 4. Reschedules upcoming reminders
```

## Limitations

### What Works

✅ While app is open
✅ Toast messages
✅ Alert dialogs
✅ In-app timers
✅ Resume detection

### What Doesn't Work

❌ When app is closed
❌ Lock screen notifications
❌ OS notification center
❌ Without opening app
❌ Background tasks

## Examples

### Complete Hydration Screen Example

```tsx
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { notificationManager } from "../../services/notificationManager";

export function HydrationScreen() {
  const [goal] = useState(2000);
  const [total, setTotal] = useState(0);

  // Setup reminders on mount
  useEffect(() => {
    notificationManager.initialize();

    // Schedule 2-hour reminders
    const reminderId = notificationManager.scheduleHydrationReminder(
      120,
      () => {
        notificationManager.showHydrationReminder(250, total, goal);
      }
    );

    return () => {
      notificationManager.cancelReminder(reminderId);
      notificationManager.cleanup();
    };
  }, []);

  // Handle adding water
  function addWater(amount: number) {
    const newTotal = total + amount;
    setTotal(newTotal);

    // Check goal
    if (newTotal >= goal && total < goal) {
      notificationManager.showGoalCompletionAlert("hydration", goal);
    }
    // Check over-hydration
    else if ((newTotal / goal) * 100 > 130) {
      notificationManager.showOverhydrationWarning(
        (newTotal / goal) * 100,
        newTotal
      );
    }
  }

  return (
    <View>
      <Text>
        {total}ml / {goal}ml
      </Text>
      {/* ... rest of UI ... */}
    </View>
  );
}
```

### Complete Medication Screen Example

```tsx
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { notificationManager } from "../../services/notificationManager";

export function MedicationScreen() {
  const medications = [
    { name: "Aspirin", dosage: "100mg", time: "08:00" },
    { name: "Vitamins", dosage: "1 tablet", time: "12:00" },
  ];

  // Schedule all medication reminders
  useEffect(() => {
    medications.forEach((med) => {
      const [hours, minutes] = med.time.split(":").map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0);

      // If time already passed, schedule for tomorrow
      if (targetTime < new Date()) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      notificationManager.scheduleMedicationReminder(targetTime, () => {
        notificationManager.showMedicationReminder(
          med.name,
          med.dosage,
          med.time
        );
      });
    });

    return () => {
      notificationManager.cancelAllReminders("medication");
    };
  }, []);

  function handleSnooze(medName: string) {
    const snoozedTime = new Date(Date.now() + 15 * 60 * 1000);
    notificationManager.scheduleMedicationReminder(snoozedTime, () => {
      const med = medications.find((m) => m.name === medName);
      notificationManager.showMedicationReminder(
        med.name,
        med.dosage,
        snoozedTime.toLocaleTimeString()
      );
    });
  }

  return (
    <View>
      {medications.map((med) => (
        <TouchableOpacity key={med.name} onPress={() => handleSnooze(med.name)}>
          <Text>
            {med.name} - {med.time}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

## Testing Checklist

```
□ Toast appears when app open
□ Alerts show for critical items
□ Reminders fire at correct times
□ Cancel operations work
□ Cleanup prevents crashes
□ Resume shows missed reminders
□ Multiple reminders don't conflict
□ Throttling prevents spam
□ AsyncStorage works
□ No native module errors
```

## Debugging

```typescript
// Enable logging (add to notificationManager)
const DEBUG = true;

if (DEBUG) {
  console.log("🔔 Notification shown:", title);
  console.log("⏰ Timer created:", timerId);
  console.log("🗑️ Timer cancelled:", timerId);
}
```

## Support

- See `EXPO_GO_NOTIFICATIONS_GUIDE.md` for detailed docs
- See `notificationManager.ts` for full API
- Check `app/_layout.tsx` for initialization pattern
- Review component examples above

---

**v2.0 - Expo Go Compatible** ✅
100% Expo Go compatible • No native modules • No EAS build
