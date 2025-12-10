import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Appearance,
    Animated,
    Easing,
    Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import { disconnect as reduxDisconnect } from '@/utils/redux/slices/serverSlice';
import { useApi } from '@/api';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlaying } from '@/contexts/PlayingContext';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Loader2 } from 'lucide-react-native';

const ServerView: React.FC = () => {
    const dispatch = useDispatch();
    const api = useApi();
    const { clearLibrary } = useLibrary();
    const { pauseSong, resetQueue } = usePlaying();
    const router = useRouter();

    const { serverUrl, username, isAuthenticated } = useSelector(
        (s: RootState) => s.server
    );

    const colorScheme = Appearance.getColorScheme();
    const isDarkMode = colorScheme === 'dark';
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
            if (!api) return alert('No API available.');
            const result = await api.auth.ping();
            if (result) alert('Server connection successful.');
            else alert('Failed to connect.');
        } catch {
            alert('Failed to connect.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await pauseSong();
            await resetQueue();
            clearLibrary();
            dispatch(reduxDisconnect());
            router.replace('/(onboarding)');
        } catch (e) {}
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                isDarkMode && styles.containerDark,
                Platform.OS === 'android' && { paddingTop: 24 },
            ]}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
                    Server
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.section, isDarkMode && styles.sectionDark]}>
                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>Server URL</Text>
                    <TextInput
                        value={serverUrl || ''}
                        editable={false}
                        placeholder="Not Set"
                        placeholderTextColor="#888"
                        style={[styles.input, isDarkMode && styles.inputDark]}
                    />

                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>Username</Text>
                    <TextInput
                        value={username || ''}
                        editable={false}
                        placeholder="Not Set"
                        placeholderTextColor="#888"
                        style={[styles.inputNoMargin, isDarkMode && styles.inputDark]}
                    />

                    <View style={{ height: 16 }} />

                    <TouchableOpacity style={styles.row} onPress={handlePing}>
                        <Text style={[styles.rowText, isDarkMode && styles.rowTextDark]}>
                            Connectivity
                        </Text>

                        {isLoading ? (
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <Loader2 size={20} color="#007BFF" />
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
                    <MaterialIcons name="logout" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ServerView;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    containerDark: { backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 6,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 12,
        color: '#000',
    },
    headerTitleDark: { color: '#fff' },
    scrollContent: { padding: 16, paddingBottom: 100 },
    section: { marginBottom: 24 },
    sectionDark: {
        backgroundColor: '#111',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#000' },
    labelDark: { color: '#fff' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        color: '#000',
        backgroundColor: '#f9f9f9',
    },
    inputNoMargin: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 0,
        color: '#000',
        backgroundColor: '#f9f9f9',
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
        marginTop: 16,
    },
    rowText: { fontSize: 16, color: '#000' },
    rowTextDark: { color: '#fff' },
    disconnectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    disconnectButtonDark: { backgroundColor: '#FF453A' },
    disconnectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});