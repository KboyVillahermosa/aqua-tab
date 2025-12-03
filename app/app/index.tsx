import React, { useCallback, useState } from 'react';
import Login from './login';
import CustomSplash from './components/branding/CustomSplash';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const handleFinish = useCallback(() => setShowSplash(false), []);

  if (showSplash) {
    return <CustomSplash onFinish={handleFinish} minimumMs={5000} />;
  }

  return <Login />;
}
