import { focusManager } from '@tanstack/react-query';
import { useEffect } from 'react'
import { AppState, AppStateStatus, Platform } from 'react-native'

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
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