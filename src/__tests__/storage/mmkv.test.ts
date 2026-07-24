import { storage } from '../../storage/mmkv';

jest.mock('react-native-mmkv', () => {
  const mockStorage: Record<string, any> = {};
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: jest.fn((key: string) => mockStorage[key] ?? null),
      set: jest.fn((key: string, value: any) => { mockStorage[key] = value; }),
      delete: jest.fn((key: string) => { delete mockStorage[key]; }),
      clearAll: jest.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }),
      getNumber: jest.fn((key: string) => mockStorage[key] ?? null),
      getBoolean: jest.fn((key: string) => mockStorage[key] ?? null),
      getAllKeys: jest.fn(() => Object.keys(mockStorage)),
    })),
  };
});

describe('Storage', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  describe('Profile CRUD', () => {
    it('should return empty profiles initially', () => {
      expect(storage.getProfiles()).toEqual([]);
    });

    it('should add a profile', () => {
      const profile = storage.addProfile({
        name: 'Local',
        url: 'http://localhost:3000',
        authType: 'none',
        authValue: '',
        isActive: false,
      });

      expect(profile.id).toBeDefined();
      expect(profile.name).toBe('Local');
      expect(profile.url).toBe('http://localhost:3000');
    });

    it('should return all profiles', () => {
      storage.addProfile({ name: 'P1', url: 'http://a.com', authType: 'none', authValue: '', isActive: false });
      storage.addProfile({ name: 'P2', url: 'http://b.com', authType: 'none', authValue: '', isActive: false });

      expect(storage.getProfiles()).toHaveLength(2);
    });

    it('should update a profile', () => {
      const profile = storage.addProfile({
        name: 'Old Name',
        url: 'http://test.com',
        authType: 'none',
        authValue: '',
        isActive: false,
      });

      storage.updateProfile(profile.id, { name: 'New Name' });
      const updated = storage.getProfiles().find(p => p.id === profile.id);
      expect(updated?.name).toBe('New Name');
    });

    it('should not update non-existent profile', () => {
      storage.updateProfile('nonexistent', { name: 'Nope' });
      expect(storage.getProfiles()).toEqual([]);
    });

    it('should delete a profile', () => {
      const profile = storage.addProfile({
        name: 'To Delete',
        url: 'http://test.com',
        authType: 'none',
        authValue: '',
        isActive: false,
      });

      storage.deleteProfile(profile.id);
      expect(storage.getProfiles()).toEqual([]);
    });

    it('should set and get active profile id', () => {
      storage.setActiveProfileId('profile-1');
      expect(storage.getActiveProfileId()).toBe('profile-1');
    });

    it('should return active profile', () => {
      const profile = storage.addProfile({
        name: 'Active',
        url: 'http://active.com',
        authType: 'none',
        authValue: '',
        isActive: false,
      });

      storage.setActiveProfileId(profile.id);
      const active = storage.getActiveProfile();
      expect(active?.id).toBe(profile.id);
      expect(active?.isActive).toBe(true);
    });

    it('should return null when no profiles exist', () => {
      expect(storage.getActiveProfile()).toBeNull();
    });
  });

  describe('Theme Settings', () => {
    it('should default to dark theme', () => {
      expect(storage.getTheme()).toBe('dark');
    });

    it('should set and get theme', () => {
      storage.setTheme('light');
      expect(storage.getTheme()).toBe('light');
    });

    it('should get default font size', () => {
      expect(storage.getFontSize()).toBe(16);
    });

    it('should set and get font size', () => {
      storage.setFontSize(18);
      expect(storage.getFontSize()).toBe(18);
    });

    it('should get default streaming speed', () => {
      expect(storage.getStreamingSpeed()).toBe(50);
    });

    it('should set and get streaming speed', () => {
      storage.setStreamingSpeed(100);
      expect(storage.getStreamingSpeed()).toBe(100);
    });

    it('should get default connection timeout', () => {
      expect(storage.getConnectionTimeout()).toBe(30000);
    });

    it('should set and get connection timeout', () => {
      storage.setConnectionTimeout(60000);
      expect(storage.getConnectionTimeout()).toBe(60000);
    });
  });

  describe('Onboarding State', () => {
    it('should default to not completed', () => {
      expect(storage.isOnboardingComplete()).toBe(false);
    });

    it('should mark onboarding as complete', () => {
      storage.setOnboardingComplete(true);
      expect(storage.isOnboardingComplete()).toBe(true);
    });

    it('should mark onboarding as incomplete', () => {
      storage.setOnboardingComplete(true);
      storage.setOnboardingComplete(false);
      expect(storage.isOnboardingComplete()).toBe(false);
    });
  });

  describe('Cache Operations', () => {
    it('should cache sessions', () => {
      const sessions = JSON.stringify([{ id: '1', title: 'Cached' }]);
      storage.setCachedSessions(sessions);
      expect(storage.getCachedSessions()).toBe(sessions);
    });

    it('should return null when no cached sessions', () => {
      expect(storage.getCachedSessions()).toBeNull();
    });

    it('should cache messages per session', () => {
      const messages = JSON.stringify([{ id: 'm1', role: 'user' }]);
      storage.setCachedMessages('session-1', messages);
      expect(storage.getCachedMessages('session-1')).toBe(messages);
    });

    it('should return null when no cached messages', () => {
      expect(storage.getCachedMessages('unknown')).toBeNull();
    });

    it('should cache models', () => {
      const models = JSON.stringify([{ id: 'gpt4' }]);
      storage.setCachedModels(models);
      expect(storage.getCachedModels()).toBe(models);
    });

    it('should return null when no cached models', () => {
      expect(storage.getCachedModels()).toBeNull();
    });

    it('should clear all caches', () => {
      storage.setCachedSessions(JSON.stringify([{ id: '1' }]));
      storage.setCachedModels(JSON.stringify([{ id: 'm1' }]));
      storage.setCachedMessages('s1', JSON.stringify([{ id: 'msg1' }]));

      storage.clearCache();

      expect(storage.getCachedSessions()).toBeNull();
      expect(storage.getCachedModels()).toBeNull();
      expect(storage.getCachedMessages('s1')).toBeNull();
    });
  });

  describe('Clear All', () => {
    it('should clear all stored data', () => {
      storage.setTheme('light');
      storage.setOnboardingComplete(true);
      storage.setCachedSessions(JSON.stringify([{ id: '1' }]));

      storage.clearAll();

      expect(storage.getTheme()).toBe('dark');
      expect(storage.isOnboardingComplete()).toBe(false);
      expect(storage.getCachedSessions()).toBeNull();
    });
  });
});
