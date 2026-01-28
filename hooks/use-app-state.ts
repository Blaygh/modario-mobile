import { supabase } from '@/libs/supabase';
import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react'
import { AppState, AppStateStatus, Platform } from 'react-native'

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }

  if (status === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
}

export function useAppState() {
    useEffect(() => {
        const subscription = AppState.addEventListener('change', onAppStateChange)
        return () => {
            subscription.remove()
        }
    }, [])
}