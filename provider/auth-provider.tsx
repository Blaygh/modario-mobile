import React, { createContext, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';

import { clearOnboardingStateCache } from '@/libs/onboarding-storage';
import { logTelemetry } from '@/libs/telemetry';
import { supabase } from '@/libs/supabase';

type AuthProps = {
  user: User | null;
  session: Session | null;
  initialized?: boolean;
  signOut?: () => Promise<void>;
};

export const AuthContext = createContext<Partial<AuthProps>>({});

export function useAuth() {
  return React.useContext(AuthContext);
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const applySession = async (nextSession: Session | null) => {
      const previousUserId = previousUserIdRef.current;
      const nextUserId = nextSession?.user?.id ?? null;
      const didUserChange = previousUserId !== nextUserId;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setInitialized(true);
      previousUserIdRef.current = nextUserId;

      if (!didUserChange) {
        return;
      }

      if (previousUserId) {
        await clearOnboardingStateCache(previousUserId);
      }
      if (!nextUserId) {
        queryClient.clear();
      } else {
        queryClient.clear();
      }

      logTelemetry({
        event: 'auth.session.changed',
        operation: 'applySession',
        userId: nextUserId,
        context: { previousUserId, nextUserId },
      });
    };

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          console.error('Failed to load initial auth session:', error);
          logTelemetry({ event: 'auth.session.restore_failed', level: 'error', operation: 'getSession', message: error.message });
        }

        await applySession(data.session);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        console.error('Failed to resolve auth session:', error);
        logTelemetry({ event: 'auth.session.restore_failed', level: 'error', operation: 'getSession', message: error instanceof Error ? error.message : 'Unknown session restore error' });
        setInitialized(true);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  const signOut = async () => {
    const currentUserId = session?.user.id ?? null;
    await supabase.auth.signOut();
    if (currentUserId) {
      await clearOnboardingStateCache(currentUserId);
    }
    queryClient.clear();
  };

  const value = {
    user,
    session,
    initialized,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
