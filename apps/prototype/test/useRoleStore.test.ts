/**
 * Тесты useRoleStore — role state machine.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useRoleStore } from '@/store/useRoleStore';

describe('useRoleStore', () => {
  beforeEach(() => {
    useRoleStore.setState({ currentRole: 'overview' });
    localStorage.clear();
  });

  it('default role is overview', () => {
    expect(useRoleStore.getState().currentRole).toBe('overview');
  });

  it('setRole updates state', () => {
    useRoleStore.getState().setRole('parent');
    expect(useRoleStore.getState().currentRole).toBe('parent');
  });

  it('migrates overview → overview (idempotent)', () => {
    useRoleStore.getState().setRole('overview');
    expect(useRoleStore.getState().currentRole).toBe('overview');
  });

  it('migrates tutor → tutor', () => {
    useRoleStore.getState().setRole('tutor');
    expect(useRoleStore.getState().currentRole).toBe('tutor');
  });

  it('migrates specialist → specialist', () => {
    useRoleStore.getState().setRole('specialist');
    expect(useRoleStore.getState().currentRole).toBe('specialist');
  });

  it('canAccess allows role to access own routes', () => {
    expect(useRoleStore.getState().canAccess('parent', '/parent/home')).toBe(true);
    expect(useRoleStore.getState().canAccess('child', '/child/cards')).toBe(true);
    expect(useRoleStore.getState().canAccess('tutor', '/tutor/home')).toBe(true);
  });

  it('canAccess denies cross-role routes', () => {
    expect(useRoleStore.getState().canAccess('parent', '/child/home')).toBe(false);
    expect(useRoleStore.getState().canAccess('child', '/parent/home')).toBe(false);
  });
});