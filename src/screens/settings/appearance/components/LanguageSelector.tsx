import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MenuView } from '@react-native-menu/menu';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { selectLanguage, selectThemeColor } from '@/utils/redux/selectors/settingsSelectors';
import { setLanguage } from '@/utils/redux/slices/settingsSlice';
import { AVAILABLE_LANGUAGES, getLanguageByCode } from '@/constants/languages';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const selected = useSelector(selectLanguage);
  const { t } = useTranslation();

  const selectedLang = getLanguageByCode(selected);
  const selectedLabel = selectedLang?.nativeName ?? selected;

  const menuActions = AVAILABLE_LANGUAGES.map(lang => ({
    id: lang.code,
    title: lang.nativeName,
    state: selected === lang.code ? ('on' as const) : ('off' as const),
  }));

  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <View style={styles.row}>
        <View style={styles.textColumn}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('settings.appearance.language.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            {t('settings.appearance.language.subtitle')}
          </Text>
        </View>

        <MenuView
          title={t('settings.appearance.language.title')}
          actions={menuActions}
          onPressAction={({ nativeEvent }) => {
            dispatch(setLanguage(nativeEvent.event));
          }}
        >
          <TouchableOpacity
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>
              {selectedLabel}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={colors.subtext}
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>
        </MenuView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textColumn: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 100,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownIcon: {
    marginLeft: 6,
  },
});
