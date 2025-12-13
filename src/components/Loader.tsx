import { useSettings } from "@/contexts/SettingsContext"
import { Loader2 } from "lucide-react-native"
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native"


function Loader() {
    const { themeColor } = useSettings();

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

    return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 32 }} >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Loader2 size={42} color={themeColor} />
            </Animated.View>
        </View>
    )
}

export default Loader;