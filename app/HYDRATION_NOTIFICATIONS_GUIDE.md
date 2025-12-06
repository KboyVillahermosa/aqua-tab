# Expo-Friendly Smart Hydration Guidance Implementation

## Overview

The Hydration component has been updated to use **Expo Notifications API** exclusively, removing all native module dependencies. This ensures full compatibility with Expo Go.

## Changes Made

### 1. Imports

- ✅ Added `import * as Notifications from 'expo-notifications'`
- ✅ Removed dependency on `notificationService` for scheduling (kept for reference)
- ✅ Uses standard React Native `Alert.alert()` for fallback warnings

### 2. Notification Permission Setup

**NEW FUNCTION**: Added on component mount (useEffect)

```typescript
async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}
```

**Purpose**:

- Requests user permission for notifications
- Configures notification handler for foreground display
- Runs once when component mounts

### 3. Smart Behind-Pace Notifications

**UPDATED FUNCTION**: `addAmount()`

When user is behind their hydration pace:

1. **In-App Alert** (Immediate)

   ```typescript
   Alert.alert("🚰 Stay Hydrated!", behindMessage);
   ```

2. **Expo Notification** (Immediate)
   ```typescript
   await Notifications.scheduleNotificationAsync({
     content: {
       title: "💧 Hydration Reminder",
       body: `Stay hydrated! Drink ${paceCheck.remaining}ml...`,
     },
     trigger: null, // Send immediately
   });
   ```

**Trigger Condition**:

- User has logged some water (newTotal > 0)
- User is behind pace calculations
- User has less than 50% of daily goal

### 4. Scheduled Hydration Reminders

**REPLACED FUNCTION**: `scheduleNextHydrationReminder()`

```typescript
async function scheduleNextHydrationReminder() {
  const intervalMinutes = 120;
  const suggestedAmountMl = Math.round(goal / 8);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧 Hydration Reminder",
      body: `Time to hydrate! Drink ${suggestedAmountMl}ml...`,
    },
    trigger: {
      seconds: intervalMinutes * 60, // 120 minutes = 7200 seconds
    },
  });
}
```

**Key Points**:

- Schedules 2 hours after each water entry
- Only schedules if user hasn't reached daily goal
- Uses seconds for time conversion (Expo requirement)
- Includes suggested amount based on daily goal

### 5. Missed Reminder Logging

**UPDATED FUNCTION**: `logMissed()`

Added Expo notification confirmation:

```typescript
await Notifications.scheduleNotificationAsync({
  content: {
    title: "⏭️ Missed Logged",
    body: "Your missed reminder has been recorded...",
  },
  trigger: null, // Send immediately
});
```

## Notification Types

### Type 1: Immediate Behind-Pace Alert

- **Trigger**: When user is behind hydration pace
- **Display**: In-app modal + Expo notification
- **When**: Immediately when logging water
- **Icon**: 💧 Hydration Reminder

### Type 2: Scheduled 2-Hour Reminder

- **Trigger**: After each water entry
- **Display**: Notification only (if app closed/backgrounded)
- **When**: 2 hours after last entry
- **Icon**: 💧 Hydration Reminder

### Type 3: Missed Reminder Confirmation

- **Trigger**: When user taps "Log Missed"
- **Display**: Notification confirmation
- **When**: Immediately after logging
- **Icon**: ⏭️ Missed Logged

## Expo Go Compatibility

### ✅ What Works

- Immediate notifications (`trigger: null`)
- Time-based scheduled notifications (`trigger: { seconds: X }`)
- Foreground notification display while app is active
- Permission requests
- Notification handlers
- In-app alerts

### ❌ What Doesn't Work (Avoided)

- Background execution when app is closed
- Native module dependencies
- Custom notification channels
- Rich media notifications
- Geofence-based triggers

## Configuration Notes

### Default Settings

- **Interval**: 120 minutes (2 hours) between reminders
- **Suggested Amount**: 1/8th of daily goal
- **Permission Check**: Runs on app launch
- **Sound**: Enabled by default
- **Badge**: Shows notification count

### Customizable Parameters

To adjust reminder behavior, modify:

```typescript
const intervalMinutes = 120; // Change to customize interval
const suggestedAmountMl = Math.round(goal / 8); // Change to customize suggestion
```

## Testing Instructions

### Test Immediate Alert

1. Log less than 50% of daily goal
2. Log another water entry
3. Should see:
   - In-app modal alert
   - Expo notification (if permissions granted)

### Test Scheduled Reminder

1. Log any water entry
2. Wait 2 hours (or manually advance time)
3. Should see notification if app is backgrounded

### Test Missed Logging

1. Tap "Log Missed" button
2. Should see:
   - Confirmation alert
   - Expo notification

## Error Handling

All notification operations are wrapped in try-catch blocks:

```typescript
try {
  await Notifications.scheduleNotificationAsync({...});
} catch (error) {
  console.log('Notification error:', error);
  // Gracefully degrades - app continues to work
}
```

## Performance Impact

- ✅ Minimal overhead
- ✅ Notifications scheduled only when needed
- ✅ No constant background polling
- ✅ Efficient memory usage
- ✅ Compatible with Expo Go

## Future Enhancements (When Moving Off Expo)

When the app moves to managed/bare Expo or native development:

- Add push notifications from server
- Enable background hydration tracking
- Implement geofence-based reminders
- Add rich media (images/sounds)
- Custom notification channels (Android 8+)
