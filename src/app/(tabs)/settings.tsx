/**
 * Settings Screen
 * App configuration and server profiles
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Shield, Globe, Key, Lock, Server, Palette, Trash2, Plus } from 'lucide-react-native';
import { getThemeColors } from '../../theme';
import { storage } from '../../storage/mmkv';
import { apiClient } from '../../network/api-client';
import type { AuthType, ServerProfile } from '../../network/types';

const authTypes: { type: AuthType; label: string; description: string; icon: typeof Shield }[] = [
  { type: 'none', label: 'None', description: 'No authentication', icon: Globe },
  { type: 'basic', label: 'Basic Auth', description: 'Username & password', icon: Lock },
  { type: 'bearer', label: 'Bearer Token', description: 'Authorization header', icon: Key },
  { type: 'apikey', label: 'API Key', description: 'X-API-Key header', icon: Shield },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const themeName = storage.getTheme() as 'dark' | 'light' | 'system';
  const theme = getThemeColors(themeName);

  const [profiles, setProfiles] = useState<ServerProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<ServerProfile>>({});

  // Load profiles
  useEffect(() => {
    setProfiles(storage.getProfiles());
    setActiveProfileId(storage.getActiveProfileId());
  }, []);

  const handleSaveProfile = () => {
    if (!editProfile.name || !editProfile.url) {
      Alert.alert('Error', 'Name and URL are required');
      return;
    }

    let updatedProfiles: ServerProfile[];
    if (editProfile.id) {
      // Update existing
      updatedProfiles = profiles.map((p) =>
        p.id === editProfile.id ? { ...p, ...editProfile } as ServerProfile : p
      );
    } else {
      // Create new
      const newProfile: ServerProfile = {
        id: Date.now().toString(),
        name: editProfile.name,
        url: editProfile.url,
        authType: editProfile.authType || 'none',
        authValue: editProfile.authValue || '',
        isActive: false,
      };
      updatedProfiles = [...profiles, newProfile];
    }

    storage.saveProfiles(updatedProfiles);
    setProfiles(updatedProfiles);
    setIsEditing(false);
    setEditProfile({});
  };

  const handleDeleteProfile = (id: string) => {
    Alert.alert('Delete Profile', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          storage.deleteProfile(id);
          setProfiles(storage.getProfiles());
          setActiveProfileId(storage.getActiveProfileId());
        },
      },
    ]);
  };

  const handleTestConnection = async (profile: ServerProfile) => {
    try {
      apiClient.setBaseURL(profile.url);
      const health = await apiClient.getHealth();
      Alert.alert('Success', `Connected! Version: ${health.version}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect');
    }
  };

  const handleSelectProfile = (id: string) => {
    storage.setActiveProfileId(id);
    setActiveProfileId(id);
    const profile = profiles.find((p) => p.id === id);
    if (profile) {
      apiClient.setBaseURL(profile.url);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Server Profiles */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Server Profiles</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {profiles.map((profile) => (
            <View
              key={profile.id}
              style={[styles.profileItem, { borderBottomColor: theme.border }]}
            >
              <TouchableOpacity
                style={styles.profileInfo}
                onPress={() => handleSelectProfile(profile.id)}
              >
                <View style={styles.profileRadio}>
                  {activeProfileId === profile.id && (
                    <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                  )}
                </View>
                <View style={styles.profileDetails}>
                  <Text style={[styles.profileName, { color: theme.text }]}>{profile.name}</Text>
                  <Text style={[styles.profileUrl, { color: theme.textMuted }]} numberOfLines={1}>
                    {profile.url}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.profileActions}>
                <TouchableOpacity onPress={() => handleTestConnection(profile)}>
                  <Text style={[styles.testBtn, { color: theme.primary }]}>Test</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteProfile(profile.id)}>
                  <Trash2 size={16} color={theme.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addProfileBtn, { borderTopColor: theme.border }]}
            onPress={() => {
              setEditProfile({ authType: 'none' });
              setIsEditing(true);
            }}
          >
            <Plus size={18} color={theme.primary} />
            <Text style={[styles.addProfileText, { color: theme.primary }]}>Add Server</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Profile Modal */}
        {isEditing && (
          <View style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editProfile.id ? 'Edit Server' : 'Add Server'}
            </Text>

            <Text style={[styles.label, { color: theme.textMuted }]}>Name</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.bgTertiary, borderColor: theme.border }]}
              value={editProfile.name || ''}
              onChangeText={(text) => setEditProfile({ ...editProfile, name: text })}
              placeholder="My Server"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.label, { color: theme.textMuted }]}>Server URL</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.bgTertiary, borderColor: theme.border }]}
              value={editProfile.url || ''}
              onChangeText={(text) => setEditProfile({ ...editProfile, url: text })}
              placeholder="https://example.com"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: theme.textMuted }]}>Authentication</Text>
            <View style={styles.authGrid}>
              {authTypes.map((a) => {
                const Icon = a.icon;
                const selected = editProfile.authType === a.type;
                return (
                  <TouchableOpacity
                    key={a.type}
                    style={[
                      styles.authCard,
                      {
                        backgroundColor: selected ? theme.bgTertiary : theme.bg,
                        borderColor: selected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setEditProfile({ ...editProfile, authType: a.type })}
                  >
                    <Icon size={16} color={selected ? theme.primary : theme.textMuted} />
                    <Text style={[styles.authLabel, { color: selected ? theme.text : theme.textMuted }]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {editProfile.authType !== 'none' && (
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.bgTertiary, borderColor: theme.border, marginTop: 8 }]}
                value={editProfile.authValue || ''}
                onChangeText={(text) => setEditProfile({ ...editProfile, authValue: text })}
                placeholder={editProfile.authType === 'basic' ? 'username:password' : 'Token/Key'}
                placeholderTextColor={theme.textMuted}
                secureTextEntry
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={[styles.saveBtnText, { color: theme.primaryText }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Theme */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 28 }]}>Theme</Text>
        <View style={styles.themeGrid}>
          {(['dark', 'light'] as const).map((name) => {
            const t = getThemeColors(name);
            const selected = themeName === name;
            return (
              <TouchableOpacity
                key={name}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: t.bg,
                    borderColor: selected ? theme.primary : t.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  storage.setTheme(name);
                }}
              >
                <View style={styles.themePreview}>
                  <View style={[styles.dot, { backgroundColor: t.primary }]} />
                  <View style={[styles.dot, { backgroundColor: t.secondary }]} />
                  <View style={[styles.dot, { backgroundColor: t.danger }]} />
                </View>
                <Text style={[styles.themeName, { color: t.text }]}>{name}</Text>
                {selected && <Check size={14} color={theme.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Font Size */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 28 }]}>Font Size</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.fontSizeRow}>
            <Text style={[styles.fontSizeLabel, { color: theme.text }]}>Message Size</Text>
            <Text style={[styles.fontSizeValue, { color: theme.primary }]}>{storage.getFontSize()}px</Text>
          </View>
          <View style={styles.fontSizeButtons}>
            {[12, 14, 16, 18, 20].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.fontSizeBtn,
                  {
                    backgroundColor: storage.getFontSize() === size ? theme.primary : theme.bgTertiary,
                    borderColor: storage.getFontSize() === size ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => storage.setFontSize(size)}
              >
                <Text
                  style={[
                    styles.fontSizeBtnText,
                    { color: storage.getFontSize() === size ? theme.primaryText : theme.text },
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Clear Cache */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 28 }]}>Data</Text>
        <TouchableOpacity
          style={[styles.dangerBtn, { backgroundColor: theme.danger + '20', borderColor: theme.danger }]}
          onPress={() => {
            Alert.alert('Clear Cache', 'This will clear all cached data. Continue?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear',
                style: 'destructive',
                onPress: () => {
                  storage.clearCache();
                  Alert.alert('Done', 'Cache cleared');
                },
              },
            ]);
          }}
        >
          <Text style={[styles.dangerBtnText, { color: theme.danger }]}>Clear Cache</Text>
        </TouchableOpacity>

        {/* About */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 28 }]}>About</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.aboutText, { color: theme.text }]}>OpenCode Mobile</Text>
          <Text style={[styles.aboutVersion, { color: theme.textMuted }]}>v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '600',
  },
  profileUrl: {
    fontSize: 12,
    marginTop: 2,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testBtn: {
    fontSize: 13,
    fontWeight: '500',
  },
  addProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  addProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modal: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  authGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  authCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  authLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeGrid: {
    gap: 8,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
  },
  themePreview: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  themeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  fontSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fontSizeLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  fontSizeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  fontSizeBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dangerBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  dangerBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  aboutVersion: {
    fontSize: 13,
    marginTop: 4,
  },
});
