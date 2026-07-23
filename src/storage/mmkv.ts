/**
 * MMKV Storage Layer
 * Persistent storage for app settings, server profiles, and cached data
 */

import { MMKV } from 'react-native-mmkv';
import type { ServerProfile, AuthType } from '../network/types';

const STORAGE_KEYS = {
  // Server Profiles
  PROFILES: 'opencode_profiles',
  ACTIVE_PROFILE_ID: 'opencode_active_profile_id',

  // App Settings
  THEME: 'opencode_theme',
  FONT_SIZE: 'opencode_font_size',
  STREAMING_SPEED: 'opencode_streaming_speed',
  CONNECTION_TIMEOUT: 'opencode_connection_timeout',

  // Cache
  SESSION_CACHE: 'opencode_session_cache',
  MESSAGE_CACHE: 'opencode_message_cache',
  MODEL_CACHE: 'opencode_model_cache',

  // Onboarding
  ONBOARDING_COMPLETE: 'opencode_onboarding_complete',
} as const;

class Storage {
  private mmkv: MMKV;

  constructor() {
    this.mmkv = new MMKV({
      id: 'opencode-storage',
    });
  }

  // ── Server Profiles ──

  getProfiles(): ServerProfile[] {
    const json = this.mmkv.getString(STORAGE_KEYS.PROFILES);
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  }

  saveProfiles(profiles: ServerProfile[]): void {
    this.mmkv.set(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }

  addProfile(profile: Omit<ServerProfile, 'id'>): ServerProfile {
    const profiles = this.getProfiles();
    const newProfile: ServerProfile = {
      ...profile,
      id: Date.now().toString(),
    };
    profiles.push(newProfile);
    this.saveProfiles(profiles);
    return newProfile;
  }

  updateProfile(id: string, updates: Partial<ServerProfile>): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === id);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...updates };
      this.saveProfiles(profiles);
    }
  }

  deleteProfile(id: string): void {
    const profiles = this.getProfiles().filter((p) => p.id !== id);
    this.saveProfiles(profiles);

    // If deleted profile was active, switch to first available
    if (this.getActiveProfileId() === id) {
      this.setActiveProfileId(profiles[0]?.id || '');
    }
  }

  getActiveProfileId(): string {
    return this.mmkv.getString(STORAGE_KEYS.ACTIVE_PROFILE_ID) || '';
  }

  setActiveProfileId(id: string): void {
    this.mmkv.set(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);

    // Update isActive flag on profiles
    const profiles = this.getProfiles();
    profiles.forEach((p) => {
      p.isActive = p.id === id;
    });
    this.saveProfiles(profiles);
  }

  getActiveProfile(): ServerProfile | null {
    const id = this.getActiveProfileId();
    const profiles = this.getProfiles();
    return profiles.find((p) => p.id === id) || profiles[0] || null;
  }

  // ── App Settings ──

  getTheme(): string {
    return this.mmkv.getString(STORAGE_KEYS.THEME) || 'dark';
  }

  setTheme(theme: string): void {
    this.mmkv.set(STORAGE_KEYS.THEME, theme);
  }

  getFontSize(): number {
    return this.mmkv.getNumber(STORAGE_KEYS.FONT_SIZE) || 16;
  }

  setFontSize(size: number): void {
    this.mmkv.set(STORAGE_KEYS.FONT_SIZE, size);
  }

  getStreamingSpeed(): number {
    return this.mmkv.getNumber(STORAGE_KEYS.STREAMING_SPEED) || 50;
  }

  setStreamingSpeed(speed: number): void {
    this.mmkv.set(STORAGE_KEYS.STREAMING_SPEED, speed);
  }

  getConnectionTimeout(): number {
    return this.mmkv.getNumber(STORAGE_KEYS.CONNECTION_TIMEOUT) || 30000;
  }

  setConnectionTimeout(timeout: number): void {
    this.mmkv.set(STORAGE_KEYS.CONNECTION_TIMEOUT, timeout);
  }

  // ── Cache ──

  getCachedSessions(): string | null {
    return this.mmkv.getString(STORAGE_KEYS.SESSION_CACHE) || null;
  }

  setCachedSessions(sessions: string): void {
    this.mmkv.set(STORAGE_KEYS.SESSION_CACHE, sessions);
  }

  getCachedMessages(sessionId: string): string | null {
    return this.mmkv.getString(`${STORAGE_KEYS.MESSAGE_CACHE}_${sessionId}`) || null;
  }

  setCachedMessages(sessionId: string, messages: string): void {
    this.mmkv.set(`${STORAGE_KEYS.MESSAGE_CACHE}_${sessionId}`, messages);
  }

  getCachedModels(): string | null {
    return this.mmkv.getString(STORAGE_KEYS.MODEL_CACHE) || null;
  }

  setCachedModels(models: string): void {
    this.mmkv.set(STORAGE_KEYS.MODEL_CACHE, models);
  }

  clearCache(): void {
    this.mmkv.delete(STORAGE_KEYS.SESSION_CACHE);
    this.mmkv.delete(STORAGE_KEYS.MODEL_CACHE);

    // Clear all message caches
    const keys = this.mmkv.getAllKeys();
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEYS.MESSAGE_CACHE)) {
        this.mmkv.delete(key);
      }
    });
  }

  // ── Onboarding ──

  isOnboardingComplete(): boolean {
    return this.mmkv.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETE) || false;
  }

  setOnboardingComplete(complete: boolean): void {
    this.mmkv.set(STORAGE_KEYS.ONBOARDING_COMPLETE, complete);
  }

  // ── Utility ──

  clearAll(): void {
    this.mmkv.clearAll();
  }
}

export const storage = new Storage();
