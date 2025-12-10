# Activity.tsx - Quick Testing Guide

## 🚀 Quick Start

1. **Start Backend**:

   ```powershell
   cd backend
   php artisan serve
   ```

2. **Start Frontend**:

   ```powershell
   cd app
   npx expo start --tunnel
   ```

3. **Navigate to Activity Tab**:
   - Open app on device/emulator
   - Login with test account
   - Tap "Activity" icon in bottom navigation

---

## ✅ Features to Test

### 1. **Real Stats Display**

- **What to Check**: Top 3 cards show Completed/Upcoming/Missed counts
- **Expected**: Real numbers from medication history, not hardcoded values
- **How to Test**:
  - Add medications with scheduled times
  - Mark some as taken → Completed should increase
  - Leave some untaken → Upcoming should show them
  - Skip some → Missed should increase

### 2. **PDF Export**

- **What to Check**: Download button in header (top-right)
- **Expected**: Generates PDF with last 30 medication entries
- **How to Test**:
  - Tap download icon
  - Wait for "Share" dialog
  - Verify PDF contains medication name, date, time, status
  - Try with no data → should show error alert

### 3. **Adherence Trends Chart**

- **What to Check**: Bar chart below stats
- **Expected**:
  - Free users see lock overlay
  - Premium users see full chart
  - Toggle switches between 7/30 days
- **How to Test**:
  - Verify bars show different heights
  - Check color coding (green/yellow/red)
  - Toggle period → bars should update
  - Tap lock (free user) → premium modal opens

### 4. **Recent Activity List**

- **What to Check**: Scrollable list of medication history
- **Expected**: Shows last 20 entries with icons and status pills
- **How to Test**:
  - Verify icons match medication types
  - Check status colors (green=completed, red=missed)
  - Verify dates are formatted correctly
  - Scroll through list → should show older entries

### 5. **Pull to Refresh**

- **What to Check**: Drag down to reload
- **Expected**: Spinner appears, data refreshes
- **How to Test**:
  - Pull down on screen
  - Mark a medication as taken in another tab
  - Return to Activity → pull to refresh
  - Stats should update

---

## 🐛 Debugging Tips

### Console Logs to Look For:

```
Initial history loaded: X entries
Displaying history. Total entries: X
Valid history entries after filtering: X
```

### Common Errors:

**"No Activity Yet"**

- Check if medications exist in database
- Verify `/medications` endpoint returns data
- Check if medication history exists

**"Stats show 0/0/0"**

- Check if `fetchMedicationHistory()` is called
- Verify API token is valid
- Check console for API errors

**"Chart not showing"**

- Check if `adherenceTrends` array has data
- Verify `calculateAdherenceTrends()` is executed
- Check if subscription is loaded

**"PDF export fails"**

- Ensure `expo-print` and `expo-sharing` are installed
- Check if `medicationHistory` has data
- Look for error in console

---

## 📊 Test Data Setup

### Create Test Medications:

1. Go to Medication tab
2. Add 3-4 medications with different times
3. Mark some as taken, skip some, leave some upcoming

### Create Test History:

- Backend automatically creates history when you mark medications
- Or manually insert into `medication_history` table:
  ```sql
  INSERT INTO medication_history (medication_id, user_id, status, time, created_at, updated_at)
  VALUES (1, 1, 'completed', '2025-12-09 10:30:00', NOW(), NOW());
  ```

### Test Premium Lock:

- Free user: Check `subscriptions` table, ensure `plan_slug = 'free'`
- Premium user: Set `plan_slug = 'premium'`

---

## 🎯 Expected Behavior

| Feature         | Free User   | Premium User |
| --------------- | ----------- | ------------ |
| Stats Cards     | ✅ Visible  | ✅ Visible   |
| PDF Export      | ❌ Disabled | ✅ Enabled   |
| Adherence Chart | 🔒 Locked   | ✅ Unlocked  |
| Recent Activity | ✅ Last 20  | ✅ Last 20   |
| Pull to Refresh | ✅ Works    | ✅ Works     |

---

## 📱 Device Testing

### iOS:

- Test on iPhone simulator
- Verify share sheet works for PDF
- Check native UI elements render correctly

### Android:

- Test on Android emulator
- Verify PDF sharing works
- Check chart bars render properly

---

## 🔍 Quick Verification Checklist

- [ ] Login works
- [ ] Activity tab loads without errors
- [ ] Stats show real numbers (not 0/0/0)
- [ ] Export button appears in header
- [ ] Chart section visible (locked or unlocked based on plan)
- [ ] Recent activity list shows entries
- [ ] PillIcon renders for each medication
- [ ] Status pills color-coded correctly
- [ ] Pull to refresh works
- [ ] No console errors

---

## 🚨 Critical Checks

1. **Authentication**: Verify token is passed in all API calls
2. **Database**: Ensure migrations are run (`php artisan migrate`)
3. **Packages**: Ensure expo-print and expo-sharing are installed
4. **Backend**: Verify all endpoints respond correctly:
   - GET /medications
   - GET /medications/{id}/history
   - GET /subscription/current

---

## 📞 If Something Breaks

1. Check backend logs: `backend/storage/logs/laravel.log`
2. Check frontend console in Expo
3. Verify database tables exist: `medications`, `medication_history`, `subscriptions`
4. Check API token is valid (hash matches in `users` table)
5. Restart both backend and frontend servers

---

**Ready to Test!** 🎉
