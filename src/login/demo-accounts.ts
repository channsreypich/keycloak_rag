// MOCK MODE ONLY (see dev-mock.ts). Never part of the theme jar.
// Demo accounts, so the preview site behaves like a real sign-in without Keycloak:
// a wrong password shows an error, too many tries lock the account for a short time,
// and new sign-ups can sign in afterwards. Kept in this browser only (localStorage).

import { LOCKOUT_SECONDS } from "./lib/constants";

export const DEMO_PASSWORD = "Demo1234";

type Role = "user" | "admin";
type Account = { email: string; password: string; role: Role };

const DEMO_ACCOUNTS: Account[] = [
    { email: "user@ragstudio.demo", password: DEMO_PASSWORD, role: "user" },
    { email: "admin@ragstudio.demo", password: DEMO_PASSWORD, role: "admin" }
];

/** Wrong passwords allowed before the temporary lock. */
const MAX_ATTEMPTS = 3;

const STORAGE_KEY = "ragstudio:demo-accounts";

type Store = {
    /** People who signed up on the preview site */
    signedUp: Account[];
    /** Wrong passwords in a row, per email */
    fails: Record<string, number>;
    /** Lock end time (ms), per email */
    lockedUntil: Record<string, number>;
    /** Admins who already set up MFA (they get "Enter code" next time) */
    mfaReady: string[];
    /** Admin who is in the middle of signing in (for the MFA step) */
    pendingAdmin?: string;
};

function load(): Store {
    const empty: Store = { signedUp: [], fails: {}, lockedUntil: {}, mfaReady: [] };
    try {
        return { ...empty, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
    } catch {
        // Storage blocked: start fresh every page load
        return empty;
    }
}

function save(store: Store) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
        // Storage blocked: the demo still works, it just forgets between pages
    }
}

const normalize = (email: string) => email.trim().toLowerCase();

function findAccount(store: Store, email: string) {
    return [...DEMO_ACCOUNTS, ...store.signedUp].find(a => a.email === normalize(email));
}

export type SignInResult =
    | { kind: "ok"; role: Role; mfaReady: boolean }
    | { kind: "wrong"; attemptsLeft?: number }
    | { kind: "locked"; secondsLeft: number };

/** Checks an email and password like Keycloak would. */
export function checkSignIn(email: string, password: string): SignInResult {
    const store = load();
    const key = normalize(email);
    const account = findAccount(store, key);

    const lockLeft = Math.ceil(((store.lockedUntil[key] ?? 0) - Date.now()) / 1000);
    if (lockLeft > 0) return { kind: "locked", secondsLeft: lockLeft };

    // Unknown email: same message as a wrong password, and nothing to count
    if (!account) return { kind: "wrong" };

    if (account.password !== password) {
        const fails = (store.fails[key] ?? 0) + 1;
        if (fails >= MAX_ATTEMPTS) {
            store.fails[key] = 0;
            store.lockedUntil[key] = Date.now() + LOCKOUT_SECONDS * 1000;
            save(store);
            return { kind: "locked", secondsLeft: LOCKOUT_SECONDS };
        }
        store.fails[key] = fails;
        save(store);
        return { kind: "wrong", attemptsLeft: MAX_ATTEMPTS - fails };
    }

    delete store.fails[key];
    if (account.role === "admin") store.pendingAdmin = key;
    save(store);
    return { kind: "ok", role: account.role, mfaReady: store.mfaReady.includes(key) };
}

/** Saves a new sign-up. False when the email is already used. */
export function signUp(email: string, password: string): boolean {
    const store = load();
    if (findAccount(store, email)) return false;
    store.signedUp.push({ email: normalize(email), password, role: "user" });
    save(store);
    return true;
}

/** After the MFA setup: next sign-in asks for the code instead. */
export function markMfaReady() {
    const store = load();
    if (store.pendingAdmin && !store.mfaReady.includes(store.pendingAdmin)) {
        store.mfaReady.push(store.pendingAdmin);
    }
    delete store.pendingAdmin;
    save(store);
}
