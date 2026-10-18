import { useState, useEffect, useCallback } from 'react';
import { AuthUser, StatusBannerState } from '../types';

export interface UseAuthSessionOptions {
  apiBaseUrl: string;
  onAuthChange?: (token: string | null) => void;
  onStatusMessage?: (banner: StatusBannerState) => void;
  onLoggedOut?: () => void;
}

export function useAuthSession({
  apiBaseUrl,
  onAuthChange,
  onStatusMessage,
  onLoggedOut,
}: UseAuthSessionOptions) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Restore auth state on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('setu_auth_token');
    const savedUser = localStorage.getItem('setu_auth_user');
    if (savedToken && savedUser) {
      try {
        setAuthToken(savedToken);
        setAuthUser(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  const handleAuthSuccess = useCallback(
    (user: AuthUser, token: string) => {
      setAuthUser(user);
      setAuthToken(token);
      localStorage.setItem('setu_auth_user', JSON.stringify(user));
      localStorage.setItem('setu_auth_token', token);
      if (onStatusMessage) {
        onStatusMessage({
          type: 'info',
          message: `Welcome, ${user.name}! Secure session active.`,
        });
      }
      if (onAuthChange) {
        onAuthChange(token);
      }
    },
    [onAuthChange, onStatusMessage]
  );

  const handleLogout = useCallback(async () => {
    if (authToken) {
      try {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {}
    }
    setAuthUser(null);
    setAuthToken(null);
    localStorage.removeItem('setu_auth_user');
    localStorage.removeItem('setu_auth_token');
    localStorage.removeItem('setu_terms_accepted');
    if (onLoggedOut) {
      onLoggedOut();
    }
    if (onStatusMessage) {
      onStatusMessage({
        type: 'info',
        message: 'You have been signed out successfully.',
      });
    }
    if (onAuthChange) {
      onAuthChange(null);
    }
  }, [authToken, apiBaseUrl, onAuthChange, onLoggedOut, onStatusMessage]);

  const handleUpdateProfile = useCallback(
    async (newName: string): Promise<boolean> => {
      if (!authToken || !authUser) return false;
      try {
        const res = await fetch(`${apiBaseUrl}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ name: newName }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setAuthUser(data.user);
          localStorage.setItem('setu_auth_user', JSON.stringify(data.user));
          if (onStatusMessage) {
            onStatusMessage({
              type: 'success',
              message: 'Profile name updated successfully!',
            });
          }
          return true;
        } else {
          if (onStatusMessage) {
            onStatusMessage({
              type: 'error',
              message: data.message || 'Failed to update profile.',
            });
          }
          return false;
        }
      } catch {
        if (onStatusMessage) {
          onStatusMessage({
            type: 'error',
            message: 'Network error while updating profile.',
          });
        }
        return false;
      }
    },
    [authToken, authUser, apiBaseUrl, onStatusMessage]
  );

  return {
    authUser,
    setAuthUser,
    authToken,
    setAuthToken,
    handleAuthSuccess,
    handleLogout,
    handleUpdateProfile,
  };
}
