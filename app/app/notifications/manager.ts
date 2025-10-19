import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Reminder = {
  id: number;
  type: string;
  title: string;
  scheduled_at?: string | null;
  interval_minutes?: number | null;
};

const STORAGE_PREFIX = 'reminder_notification_';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // include newer behavior flags for newer SDKs
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export async function initNotifications() {
  if (Device.isDevice) {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  }
  // set up a REMINDER category with snooze/missed actions
  try {
    await Notifications.setNotificationCategoryAsync('REMINDER', [
      { identifier: 'snooze15', buttonTitle: 'Snooze 15m' },
      { identifier: 'snooze30', buttonTitle: 'Snooze 30m' },
      { identifier: 'snooze60', buttonTitle: 'Snooze 60m' },
      { identifier: 'missed', buttonTitle: 'Mark missed' },
    ] as any);
  } catch (err) {
    console.log('setNotificationCategoryAsync err', err);
  }
}

let _responseListener: any = null;

export function registerResponseHandler(handler: (resp: any) => void) {
  if (_responseListener) _responseListener.remove();
  _responseListener = Notifications.addNotificationResponseReceivedListener((resp: any) => {
    try { handler(resp); } catch (err) { console.log('response handler err', err); }
  });
}

export function unregisterResponseHandler() {
  if (_responseListener) {
    _responseListener.remove();
    _responseListener = null;
  }
}

async function storeMapping(reminderId: number, notificationId: string | null) {
  const key = `${STORAGE_PREFIX}${reminderId}`;
  if (!notificationId) return AsyncStorage.removeItem(key);
  return AsyncStorage.setItem(key, notificationId);
}

async function getMapping(reminderId: number) {
  const key = `${STORAGE_PREFIX}${reminderId}`;
  return AsyncStorage.getItem(key);
}

export async function scheduleLocalReminder(rem: Reminder) {
  if (!rem.scheduled_at) return null;
  const date = new Date(rem.scheduled_at);
  if (isNaN(date.getTime())) return null;

  const body = rem.type === 'water'
    ? `Time to hydrate 💧 — 200ml suggested.`
    : `Take ${rem.title} 💊`;

  const schedulingOptions: any = {
    content: {
      title: rem.type === 'water' ? 'Time to hydrate 💧' : `Medication: ${rem.title}`,
      body,
      data: { reminderId: rem.id },
    },
    trigger: { date } as any,
  };

  try {
    const id = await Notifications.scheduleNotificationAsync(schedulingOptions);
    await storeMapping(rem.id, id);
    return id;
  } catch (e) {
    console.log('scheduleLocalReminder err', e);
    return null;
  }
}

export async function cancelLocalReminder(reminderId: number) {
  const id = await getMapping(reminderId);
  if (id) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) { console.log('cancelLocalReminder err', e); }
    await storeMapping(reminderId, null);
  }
}

export async function snoozeLocalReminder(reminderId: number, minutes: number) {
  // cancel and reschedule for now + minutes
  await cancelLocalReminder(reminderId);
  const newDate = new Date(Date.now() + minutes * 60 * 1000);
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: 'Snoozed reminder', body: `Reminder snoozed ${minutes} minutes`, data: { reminderId } },
      trigger: { date: newDate } as any,
    });
    await storeMapping(reminderId, id);
    return id;
  } catch (e) { console.log('snoozeLocalReminder err', e); return null; }
}

// Smart reminder adjustment (client-side heuristic)
export async function adjustReminderFrequencyIfNeeded(reminder: Reminder, missedCount: number | undefined, updateRemote?: (id:number, changes:any)=>Promise<any>) {
  if (!reminder.interval_minutes || !missedCount) return null;
  if (missedCount < 3) return null; // require 3+ misses to trigger
  const newInterval = Math.max(5, Math.floor((reminder.interval_minutes as number) * 0.8));
  // if we have a server update helper, persist change remotely
  if (updateRemote) {
    try { return await updateRemote(reminder.id, { interval_minutes: newInterval }); } catch (e) { console.log('adjustReminderFrequencyIfNeeded err', e); }
  }
  return null;
}

export default {
  initNotifications,
  scheduleLocalReminder,
  cancelLocalReminder,
  snoozeLocalReminder,
  adjustReminderFrequencyIfNeeded,
};
