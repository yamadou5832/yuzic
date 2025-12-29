import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    FlatList,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/redux/store';
import {
    setActiveServer,
    removeServer,
} from '@/utils/redux/slices/serversSlice';
import { useSettings } from '@/contexts/SettingsContext';
import { AntDesign } from '@expo/vector-icons';

export default function Servers() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { themeColor } = useSettings();

    const servers = useSelector((state: RootState) => state.servers.servers);
    const activeServerId = useSelector(
        (state: RootState) => state.servers.activeServerId
    );

    const handleSelectServer = (id: string) => {
        dispatch(setActiveServer(id));
        router.push('(home)');
    };

    const handleAddServer = () => {
        router.push('/(onboarding)/connect');
    };

    const handleDeleteServer = (id: string, serverUrl: string) => {
        Alert.alert(
            'Delete Server',
            `Remove ${serverUrl.replace(/^https?:\/\//, '')}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(removeServer(id));
                    },
                },
            ]
        );
    };

    const renderServer = ({ item }: any) => {
        const isActive = item.id === activeServerId;

        return (
            <View style={styles.serverRow}>
                <TouchableOpacity
                    style={styles.serverInfo}
                    onPress={() => handleSelectServer(item.id)}
                >
                    <Text style={styles.serverName}>
                        {item.serverUrl.replace(/^https?:\/\//, '')}
                    </Text>
                    <Text style={styles.serverSubtext}>
                        {item.type === 'jellyfin'
                            ? 'Jellyfin Server'
                            : 'Navidrome Server'}
                        {isActive ? ' • Active' : ''}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() =>
                        handleDeleteServer(item.id, item.serverUrl)
                    }
                    hitSlop={10}
                >
                    <AntDesign name="delete" size={18} color="#cc4444" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Your Servers</Text>
                <Text style={styles.subtitle}>
                    Choose a server to continue or add a new one.
                </Text>

                <FlatList
                    data={servers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderServer}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            No servers added yet.
                        </Text>
                    }
                    contentContainerStyle={{ paddingTop: 20 }}
                />
            </View>

            <View style={styles.bottomContent}>
                <TouchableOpacity onPress={handleAddServer}>
                    <View style={styles.buttonContainer}>
                        <View
                            style={[
                                styles.offsetButton,
                                { backgroundColor: `${themeColor}AA` },
                            ]}
                        />
                        <View
                            style={[
                                styles.button,
                                {
                                    backgroundColor: themeColor,
                                    shadowColor: themeColor,
                                },
                            ]}
                        >
                            <Text style={styles.buttonText}>Add Server</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        paddingTop: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#aaa',
    },
    serverRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    serverInfo: {
        flex: 1,
        paddingRight: 12,
    },
    serverName: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 2,
    },
    serverSubtext: {
        fontSize: 13,
        color: '#888',
    },
    emptyText: {
        textAlign: 'center',
        color: '#777',
        marginTop: 40,
        fontSize: 14,
    },
    bottomContent: {
        marginBottom: Platform.OS === 'ios' ? 40 : 20,
        alignItems: 'center',
    },
    buttonContainer: {
        width: '90%',
        alignItems: 'center',
    },
    offsetButton: {
        position: 'absolute',
        top: 6,
        width: '100%',
        height: 48,
        borderRadius: 8,
        zIndex: -1,
    },
    button: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});