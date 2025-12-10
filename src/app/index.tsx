import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const { type, serverUrl, isAuthenticated } = useSelector(
    (s: RootState) => s.server
  );

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (isAuthenticated && type !== "none" && serverUrl) {
      router.replace("/(home)");
    } else {
      router.replace("/(onboarding)");
    }
  }, [isMounted, isAuthenticated, type, serverUrl]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
      }}
    >
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}