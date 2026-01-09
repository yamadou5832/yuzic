import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Platform,
    Appearance,
} from 'react-native';

import Header from '../components/Header';

import Stats from './components/Stats';
import AudioQuality from './components/AudioQuality';
import Downloads from './components/Downloads';

const LibrarySettings: React.FC = () => {
    const colorScheme = Appearance.getColorScheme();
    const isDarkMode = colorScheme === 'dark';

    return (
        <SafeAreaView
            style={[
                styles.container,
                isDarkMode && styles.containerDark,
                Platform.OS === 'android' && { paddingTop: 24 },
            ]}
        >
            <Header title="Library" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Stats />
                <AudioQuality />
                <Downloads />
            </ScrollView>
        </SafeAreaView>
    );
};

export default LibrarySettings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    containerDark: {
        backgroundColor: '#000',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
});