import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Appearance,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export type ContextMenuAction = {
  id: string;
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  destructive?: boolean;
  primary?: boolean;
  dividerBefore?: boolean;
};

interface ContextMenuModalProps {
  visible: boolean;
  onClose: () => void;
  actions: ContextMenuAction[];
}

const ContextMenuModal: React.FC<ContextMenuModalProps> = ({
  visible,
  onClose,
  actions,
}) => {
  const isDarkMode = Appearance.getColorScheme() === 'dark';

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.96);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        unstable_pressDelay={40}
        accessibilityRole="button"
        accessibilityLabel="Dismiss menu"
      >
        <Animated.View
          style={[
            styles.menu,
            isDarkMode && styles.menuDark,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          {actions.map(action => (
            <View key={action.id}>
              {action.dividerBefore && (
                <View
                  style={[
                    styles.divider,
                    isDarkMode && styles.dividerDark,
                  ]}
                />
              )}

              <Pressable
                onPress={() => {
                  if (action.disabled) return;
                  Haptics.selectionAsync();
                  action.onPress();
                  onClose();
                }}
                disabled={action.disabled}
                accessibilityRole="button"
                accessibilityState={{ disabled: action.disabled }}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                  isDarkMode && pressed && styles.menuItemPressedDark,
                  action.disabled && styles.menuItemDisabled,
                ]}
              >
                {action.icon && (
                  <Ionicons
                    name={action.icon}
                    size={20}
                    style={[
                      styles.icon,
                      isDarkMode && styles.iconDark,
                      action.destructive && styles.iconDestructive,
                    ]}
                  />
                )}

                <Text
                  numberOfLines={1}
                  style={[
                    styles.menuText,
                    isDarkMode && styles.menuTextDark,
                    action.destructive && styles.menuTextDestructive,
                    action.primary && styles.menuTextPrimary,
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            </View>
          ))}

          <View
            style={[
              styles.divider,
              isDarkMode && styles.dividerDark,
            ]}
          />

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
              isDarkMode && pressed && styles.menuItemPressedDark,
            ]}
          >
            <Ionicons
              name="close"
              size={20}
              style={[styles.icon, isDarkMode && styles.iconDark]}
            />
            <Text
              style={[
                styles.menuText,
                isDarkMode && styles.menuTextDark,
              ]}
            >
              Cancel
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default ContextMenuModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    alignSelf: 'center',
    minWidth: 320,
    maxWidth: 440,
  },
  menuDark: {
    backgroundColor: '#1c1c1e',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  menuItemPressedDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuItemDisabled: {
    opacity: 0.45,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  dividerDark: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  icon: {
    marginRight: 14,
    color: '#111',
  },
  iconDark: {
    color: '#f2f2f2',
  },
  iconDestructive: {
    color: '#ff3b30',
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    flexShrink: 1,
  },
  menuTextDark: {
    color: '#f2f2f2',
  },
  menuTextDestructive: {
    color: '#ff3b30',
  },
  menuTextPrimary: {
    fontWeight: '600',
  },
});