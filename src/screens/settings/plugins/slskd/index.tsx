import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Appearance,
  Animated,
  Easing,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { Loader2 } from 'lucide-react-native';
import { toast } from '@backpackapp-io/react-native-toast';

import Header from '../../components/Header';
import * as slskd from '@/api/slskd';

import {
  selectSlskdServerUrl,
  selectSlskdApiKey,
  selectSlskdAuthenticated,
  selectSlskdConfig,
} from '@/utils/redux/selectors/slskdSelectors';
import {
  setServerUrl,
  setApiKey,
  setAuthenticated,
  disconnect,
} from '@/utils/redux/slices/slskdSlice';
import { selectThemeColor } from '@/utils/redux/selectors/settingsSelectors';

const SlskdView: React.FC = () => {
  const dispatch = useDispatch();
  const themeColor = useSelector(selectThemeColor);

  const serverUrl = useSelector(selectSlskdServerUrl);
  const apiKey = useSelector(selectSlskdApiKey);
  const isAuthenticated = useSelector(selectSlskdAuthenticated);
  const config = useSelector(selectSlskdConfig);

  const isDarkMode = Appearance.getColorScheme() === 'dark';

  const [isLoading, setIsLoading] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePing = async () => {
    setIsLoading(true);
    try {
      await slskd.testConnection(config);
      console.log("hello")
      dispatch(setAuthenticated(true));
      toast.success('slskd connection successful.');
    } catch {
      dispatch(setAuthenticated(false));
      toast.error('Failed to connect to slskd.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    dispatch(disconnect());
    toast('Disconnected from slskd.');
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <Header title="Slskd" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.label, isDarkMode && styles.labelDark]}>
            Server URL
          </Text>
          <TextInput
            value={serverUrl}
            onChangeText={(v) => dispatch(setServerUrl(v))}
            placeholder="http://localhost:5030"
            placeholderTextColor="#888"
            style={[styles.input, isDarkMode && styles.inputDark]}
          />

          <Text style={[styles.label, isDarkMode && styles.labelDark]}>
            API Key
          </Text>
          <TextInput
            value={apiKey}
            onChangeText={(v) => dispatch(setApiKey(v))}
            placeholder="Enter API Key"
            placeholderTextColor="#888"
            secureTextEntry
            style={[styles.input, isDarkMode && styles.inputDark]}
          />

          <TouchableOpacity style={styles.row} onPress={handlePing}>
            <Text style={[styles.rowText, isDarkMode && styles.rowTextDark]}>
              Connectivity
            </Text>

            {isLoading ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Loader2 size={20} color={themeColor} />
              </Animated.View>
            ) : (
              <MaterialIcons
                name={isAuthenticated ? 'check-circle' : 'cancel'}
                size={20}
                color={isAuthenticated ? 'green' : 'red'}
              />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.disconnectButton, isDarkMode && styles.disconnectButtonDark]}
          onPress={handleDisconnect}
        >
          <MaterialIcons
            name="logout"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.disconnectButtonText}>Disconnect</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SlskdView;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    containerDark: { backgroundColor: '#000' },
        header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 6,
    },
    headerDark: { 
        // No background, keep it transparent like OpenAI
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 12,
        color: '#000',
    },
    headerTitleDark: {
        color: '#fff',
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: { padding: 16, paddingBottom: 100 },
    section: { marginBottom: 24 },
    sectionDark: { backgroundColor: '#111', padding: 16, borderRadius: 10 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#000' },
    labelDark: { color: '#fff' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        color: '#000',
        backgroundColor: '#fff',
    },
    inputDark: {
        borderColor: '#444',
        backgroundColor: '#1a1a1a',
        color: '#fff',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    rowText: { fontSize: 16, color: '#000' },
    rowTextDark: { color: '#fff' },
    emptyText: { textAlign: 'center', marginVertical: 16, fontSize: 16, color: '#666' },
    emptyTextDark: { color: '#aaa' },
    itemContainer: { padding: 16, borderRadius: 10, marginBottom: 12 },
    itemInfo: { flexDirection: 'column' },
    albumTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
    albumTitleDark: { color: '#fff' },
    artistName: { fontSize: 14, color: '#666', marginTop: 4 },
    artistNameDark: { color: '#aaa' },
    status: { fontSize: 12, color: '#888', marginTop: 6 },
    statusDark: { color: '#888' },
    progressBarBackground: {
        height: 6,
        width: '100%',
        backgroundColor: '#ddd',
        borderRadius: 3,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressBarBackgroundDark: { backgroundColor: '#333' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    warningContainer: { marginTop: 8, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 6 },
    warningContainerDark: { backgroundColor: '#1a1a1a' },
    warningItem: { marginBottom: 6 },
    warningTitle: { fontSize: 13, fontWeight: '600', color: '#555' },
    warningTitleDark: { color: '#ccc' },
    warningMessage: { fontSize: 12, color: '#777', marginLeft: 8, marginTop: 2 },
    warningMessageDark: { color: '#aaa' },
    disconnectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    disconnectButtonDark: {
        backgroundColor: '#FF453A',
    },
    disconnectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});