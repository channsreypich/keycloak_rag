// Sign-in lock shown on the Sign In page.
//
// Keycloak does the real lock, but it never tells the page how many attempts
// failed or how long the lock lasts. So this browser counts wrong passwords for
// each email and works out the time with the same formula as Keycloak.
// If Keycloak says "locked" and this browser has no count (for example another
// device failed), the page shows the shortest lock.

import { useEffect, useState } from "react";
import { LOCKOUT_SECONDS } from "./constants";

// Keep these in sync with Realm → Security defenses → Brute force detection.
/** "Max login failures" */
export const MAX_FAILURES = 5;
/** "Wait increment" with the "Linear" strategy: 5 wrong = 1 min, 6 wrong = 2 min, 7 wrong = 3 min, ... */
export const WAIT_INCREMENT_SECONDS = LOCKOUT_SECONDS;
/** "Max wait": the lock never lasts longer than 15 minutes */
export const MAX_WAIT_SECONDS = 15 * 60;
/** "Failure reset time": Keycloak forgets old failures after 12 hours */
const FAILURE_RESET_MS = 12 * 60 * 60 * 1000;

const STORAGE_KEY = "ragstudio:login-locks";

type LockEntry = { failures: number; lastFailureAt: number; lockedUntil: number };
type Locks = Record<string, LockEntry>;

function readLocks(): Locks {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Locks;
    } catch {
        return {};
    }
}

function writeLocks(locks: Locks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(locks));
    } catch {
        // Storage blocked: Keycloak still locks, the page just shows less detail
    }
}

function emailKey(email: string) {
    return email.trim().toLowerCase();
}

function readEntry(locks: Locks, key: string): LockEntry | undefined {
    const entry = locks[key];
    return entry && Date.now() - entry.lastFailureAt < FAILURE_RESET_MS ? entry : undefined;
}

/** Seconds a lock lasts after this many wrong passwords (0 = no lock). */
export function lockSecondsFor(failures: number) {
    if (failures < MAX_FAILURES) return 0;
    return Math.min(MAX_WAIT_SECONDS, WAIT_INCREMENT_SECONDS * (failures - MAX_FAILURES + 1));
}

/** Call after Keycloak rejects a password. */
export function recordWrongPassword(email: string) {
    const locks = readLocks();
    const key = emailKey(email);
    const failures = (readEntry(locks, key)?.failures ?? 0) + 1;
    const now = Date.now();
    locks[key] = { failures, lastFailureAt: now, lockedUntil: now + lockSecondsFor(failures) * 1000 };
    writeLocks(locks);
}

/** Call when Keycloak says "locked". Keeps a running countdown, or starts the shortest lock. */
export function recordServerLock(email: string, seconds: number = WAIT_INCREMENT_SECONDS) {
    const locks = readLocks();
    const key = emailKey(email);
    const entry = readEntry(locks, key);
    const now = Date.now();
    if (entry && entry.lockedUntil > now) return;
    locks[key] = { failures: entry?.failures ?? MAX_FAILURES, lastFailureAt: now, lockedUntil: now + seconds * 1000 };
    writeLocks(locks);
}

/** Call after a sign in works or the password is reset. */
export function clearLock(email: string) {
    const locks = readLocks();
    delete locks[emailKey(email)];
    writeLocks(locks);
}

export function lockSecondsLeft(email: string) {
    const entry = readEntry(readLocks(), emailKey(email));
    return entry ? Math.max(0, Math.ceil((entry.lockedUntil - Date.now()) / 1000)) : 0;
}

/** Attempts left before the lock. Undefined before the first wrong password, and once the limit is reached. */
export function attemptsLeftFor(email: string) {
    const failures = readEntry(readLocks(), emailKey(email))?.failures ?? 0;
    return failures > 0 && failures < MAX_FAILURES ? MAX_FAILURES - failures : undefined;
}

/** The email that is locked right now, so coming back to Sign In still shows its countdown. */
export function activeLockEmail() {
    const now = Date.now();
    return Object.entries(readLocks()).find(([, entry]) => entry.lockedUntil > now)?.[0];
}

/** Seconds left for this email, updated once a second. */
export function useLockSeconds(email: string) {
    const [, setTick] = useState(0);
    const left = lockSecondsLeft(email);

    useEffect(() => {
        if (left <= 0) return;
        const timer = setTimeout(() => setTick(tick => tick + 1), 1000);
        return () => clearTimeout(timer);
    }, [left]);

    return left;
}
