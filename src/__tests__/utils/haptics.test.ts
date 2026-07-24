jest.mock('expo-haptics', () => ({
  Haptics: {
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    selectionAsync: jest.fn(),
    ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
    NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  },
}));

import { impact, notification, selection, haptics } from '../../utils/haptics';

const { Haptics } = require('expo-haptics');

describe('haptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('impact', () => {
    it('should trigger impact with medium style by default', () => {
      impact();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should trigger impact with light style', () => {
      impact('light');
      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    });

    it('should trigger impact with heavy style', () => {
      impact('heavy');
      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    });
  });

  describe('notification', () => {
    it('should trigger success notification', () => {
      notification('success');
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    });

    it('should trigger warning notification', () => {
      notification('warning');
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');
    });

    it('should trigger error notification', () => {
      notification('error');
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
    });
  });

  describe('selection', () => {
    it('should trigger selection feedback', () => {
      selection();
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });

  describe('convenience functions', () => {
    it('buttonPress should call impact light', () => {
      haptics.buttonPress();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    });

    it('buttonLongPress should call impact medium', () => {
      haptics.buttonLongPress();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('tabSwitch should call selection', () => {
      haptics.tabSwitch();
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('deleteAction should call impact heavy', () => {
      haptics.deleteAction();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    });

    it('copyAction should call notification success', () => {
      haptics.copyAction();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    });

    it('networkError should call notification error', () => {
      haptics.networkError();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
    });

    it('streamingToken should be a no-op', () => {
      const result = haptics.streamingToken();
      expect(result).toBeUndefined();
    });
  });
});
