#!/bin/bash

# Script to re-enable notifications after Metro restart
echo "Re-enabling notification imports..."

# Re-enable imports in Notification.tsx
sed -i 's|// import \* as Notifications from '\''expo-notifications'\'';|import * as Notifications from '\''expo-notifications'\'';|g' app/app/components/pages/notification/Notification.tsx
sed -i 's|// import \* as Device from '\''expo-device'\'';|import * as Device from '\''expo-device'\'';|g' app/app/components/pages/notification/Notification.tsx

# Re-enable imports in Medication.tsx
sed -i 's|// import \* as Notifications from '\''expo-notifications'\'';|import * as Notifications from '\''expo-notifications'\'';|g' app/app/components/pages/medication/Medication.tsx

# Re-enable imports in Hydration.tsx
sed -i 's|// import \* as Notifications from '\''expo-notifications'\'';|import * as Notifications from '\''expo-notifications'\'';|g' app/app/components/pages/hydration/Hydration.tsx

echo "Notification imports re-enabled!"
echo "Please restart your Metro bundler with: npx expo start --clear"
