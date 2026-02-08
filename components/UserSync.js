'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function UserSync() {
    const { isSignedIn, user } = useUser();
    const syncedRef = useRef(false);

    useEffect(() => {
        if (isSignedIn && user && !syncedRef.current) {
            syncedRef.current = true; // Prevent double firing
            fetch('/api/auth/sync', { method: 'POST' })
                .catch(err => console.error('Background sync failed:', err));
        }
    }, [isSignedIn, user]);

    return null;
}
