import { getTrackedWardrobeImportSessionIds, removeTrackedWardrobeImportSessionIds } from '@/libs/wardrobe-import-tracker';
import {
  getWardrobeImportDetails,
  isImportCompleteStatus,
  isImportFailedStatus,
  isImportProcessingStatus,
  isReviewRequiredStatus,
  listWardrobeImports,
} from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

const POLL_INTERVAL_MS = 15000;

export function WardrobeImportReviewMonitor() {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const userId = session?.user?.id ?? null;
  const accessToken = session?.access_token ?? null;

  const [trackedSessionIds, setTrackedSessionIds] = useState<string[]>([]);
  const alertedSessionIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    alertedSessionIdsRef.current.clear();

    if (!userId) {
      setTrackedSessionIds([]);
      return;
    }

    let isActive = true;

    const loadTrackedSessionIds = async () => {
      const trackedIds = await getTrackedWardrobeImportSessionIds(userId);

      if (isActive) {
        setTrackedSessionIds(trackedIds);
      }
    };

    loadTrackedSessionIds();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const isReviewRoute = useMemo(() => pathname.startsWith('/wardrobe/review') || pathname.startsWith('/wardrobe/reviews'), [pathname]);

  const pollImports = useCallback(async () => {
    if (!accessToken || !userId) {
      return;
    }

    const latestTrackedSessionIds = await getTrackedWardrobeImportSessionIds(userId);

    if (latestTrackedSessionIds.join(',') !== trackedSessionIds.join(',')) {
      setTrackedSessionIds(latestTrackedSessionIds);
    }

    const [accountImports, trackedImportDetails] = await Promise.all([
      listWardrobeImports(accessToken, 50, 0),
      Promise.all(
        latestTrackedSessionIds.map(async (sessionId) => {
          try {
            return await getWardrobeImportDetails(accessToken, sessionId);
          } catch {
            return null;
          }
        }),
      ),
    ]);

    const reviewRequiredSessions = new Map<string, { id: string; status: string }>();

    accountImports.import_sessions.forEach((importSession) => {
      if (isReviewRequiredStatus(importSession.status)) {
        reviewRequiredSessions.set(importSession.id, { id: importSession.id, status: importSession.status });
      }
    });

    trackedImportDetails.forEach((detail) => {
      if (detail && isReviewRequiredStatus(detail.import_session.status)) {
        reviewRequiredSessions.set(detail.import_session.id, {
          id: detail.import_session.id,
          status: detail.import_session.status,
        });
      }
    });

    const resolvedTrackedIds = trackedImportDetails
      .filter((detail): detail is NonNullable<typeof detail> => Boolean(detail))
      .filter(
        (detail) =>
          isReviewRequiredStatus(detail.import_session.status) ||
          isImportCompleteStatus(detail.import_session.status) ||
          isImportFailedStatus(detail.import_session.status) ||
          !isImportProcessingStatus(detail.import_session.status),
      )
      .map((detail) => detail.import_session.id);

    if (resolvedTrackedIds.length) {
      const nextTrackedIds = await removeTrackedWardrobeImportSessionIds(userId, resolvedTrackedIds);
      setTrackedSessionIds(nextTrackedIds);
    }

    const firstReviewRequiredSession = [...reviewRequiredSessions.values()][0];

    if (!firstReviewRequiredSession || isReviewRoute || alertedSessionIdsRef.current.has(firstReviewRequiredSession.id)) {
      return;
    }

    alertedSessionIdsRef.current.add(firstReviewRequiredSession.id);

    Alert.alert('Wardrobe review ready', 'Your latest wardrobe import is ready to review and commit.', [
      {
        text: 'Later',
        style: 'cancel',
      },
      {
        text: 'Review now',
        onPress: () => router.push({ pathname: '/wardrobe/review', params: { sessionId: firstReviewRequiredSession.id } }),
      },
    ]);
  }, [accessToken, isReviewRoute, router, trackedSessionIds, userId]);

  useEffect(() => {
    if (!accessToken || !userId) {
      return;
    }

    pollImports();

    const intervalId = setInterval(() => {
      pollImports();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [accessToken, pollImports, userId]);

  return null;
}
