// DEV ONLY: click through the theme with mock data (`npm run dev`).
// main.tsx loads this file only in dev, and only when Keycloak did not
// give a real `window.kcContext`. It is never part of the built theme.
//
// Open a screen:
//   http://localhost:5173/                                → Sign in
//   http://localhost:5173/login-actions/registration      → Sign up
//   http://localhost:5173/login-actions/reset-credentials → Forgot password
//   http://localhost:5173/?page=login-otp.ftl             → any page id
//   http://localhost:5173/?state=suspended                → Sign in variants
//     (state: wrong-password, attempts-left, locked, suspended, pending-deletion, email-sent)
//   http://localhost:5173/?page=error.ftl&state=no-account  → No Account Found
//   Verify email → click "Resend verification email"      → New Link Sent

import type { KcContext } from "./KcContext";
import { getKcContextMock, MOCK_EMAIL, mockFieldErrors, mockSocialProviders } from "./KcPageStory";

/** Where "signed in" sends you: the RAGStudio web app. */
const APP_URL = import.meta.env.VITE_APP_URL ?? "http://localhost:3000";
const DASHBOARD_URL = `${APP_URL}/dashboard`;

// Same paths as real Keycloak, so `loginActionUrl()` in lib/kc-urls.ts works.
const LOGIN_URL = "/login-actions/authenticate";
const REGISTRATION_URL = "/login-actions/registration";
const RESET_URL = "/login-actions/reset-credentials";

type PageId = KcContext["pageId"];

function pageIdFromUrl(): PageId {
    const page = new URLSearchParams(window.location.search).get("page");
    if (page) return page as PageId;

    const path = window.location.pathname;
    if (path.endsWith(REGISTRATION_URL)) return "register.ftl";
    if (path.endsWith(RESET_URL)) return "login-reset-password.ftl";
    return "login.ftl";
}

/** Mock data per page. In real Keycloak the server sends all of this. */
function overridesFor(pageId: PageId, state: string | null): object {
    const social = { displayInfo: true, providers: mockSocialProviders };

    switch (pageId) {
        case "login.ftl": {
            const base = {
                social,
                realm: { rememberMe: true, resetPasswordAllowed: true, registrationAllowed: true },
                login: { rememberMe: "on" },
                // Submitting the form = signed in
                url: { loginAction: DASHBOARD_URL }
            };
            if (state === "wrong-password") {
                return {
                    ...base,
                    login: { username: MOCK_EMAIL },
                    message: { type: "error", summary: "Invalid username or password." },
                    messagesPerField: mockFieldErrors({ username: "Invalid username or password." })
                };
            }
            if (state === "suspended") {
                return {
                    ...base,
                    login: { username: MOCK_EMAIL },
                    message: { type: "error", summary: "Account is disabled, contact your administrator." },
                    suspension: {
                        reason: "Repeated reports of inaccurate answers on 2 chatbots",
                        suspendedAt: "2026-10-08"
                    }
                };
            }
            if (state === "locked") {
                return {
                    ...base,
                    login: { username: MOCK_EMAIL },
                    message: {
                        type: "error",
                        summary: "Account is temporarily disabled; contact your administrator or retry later."
                    },
                    bruteForce: { lockedForSeconds: 119 }
                };
            }
            if (state === "attempts-left") {
                return {
                    ...base,
                    login: { username: MOCK_EMAIL },
                    message: { type: "error", summary: "Invalid username or password." },
                    messagesPerField: mockFieldErrors({ username: "Invalid username or password." }),
                    bruteForce: { attemptsLeft: 3 }
                };
            }
            if (state === "pending-deletion") {
                const deleteOn = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
                return { ...base, pendingDeletion: { deleteOn, restoreUrl: DASHBOARD_URL } };
            }
            if (state === "email-sent") {
                return {
                    ...base,
                    auth: { attemptedUsername: MOCK_EMAIL },
                    message: {
                        type: "success",
                        summary: "You should receive an email shortly with further instructions."
                    }
                };
            }
            return base;
        }
        case "register.ftl":
            return { social, url: { registrationAction: "/?page=login-verify-email.ftl" } };
        case "login-verify-email.ftl":
            return {
                user: { email: MOCK_EMAIL },
                message: { type: "warning", summary: "You need to verify your email address to activate your account." },
                // "Resend email" stays on this page
                url: { loginAction: "/?page=login-verify-email.ftl" }
            };
        case "login-update-password.ftl":
            return { auth: { attemptedUsername: MOCK_EMAIL }, url: { loginAction: DASHBOARD_URL } };
        case "error.ftl":
            if (state === "no-account") {
                return {
                    message: {
                        type: "error",
                        summary: `User ${MOCK_EMAIL} authenticated with identity provider google does not exist. Please contact your administrator.`
                    }
                };
            }
            return {};
        case "info.ftl":
            // The designed info screen: "Email Verified" (after clicking the email link)
            return {
                auth: { attemptedUsername: MOCK_EMAIL },
                message: { type: "success", summary: "Your email address has been verified." },
                url: {}
            };
        case "login-reset-password.ftl":
            return { url: { loginAction: `${LOGIN_URL}?state=email-sent` } };
        default:
            // MFA, update password, ...: finishing the form = signed in
            return { url: { loginAction: DASHBOARD_URL } };
    }
}

export function getDevKcContext(): KcContext {
    const pageId = pageIdFromUrl();
    const state = new URLSearchParams(window.location.search).get("state");

    const { url, ...rest } = overridesFor(pageId, state) as { url?: object };

    return getKcContextMock({
        pageId,
        overrides: {
            ...rest,
            url: {
                loginUrl: LOGIN_URL,
                loginRestartFlowUrl: LOGIN_URL,
                registrationUrl: REGISTRATION_URL,
                loginResetCredentialsUrl: RESET_URL,
                ...url
            }
        } as never
    });
}

/**
 * There is no Keycloak to POST to, so a form submit just opens the form's
 * `action` URL (set per page above). That URL is the next mock screen.
 */
export function installMockSubmit() {
    // Bubble phase (after React's onSubmit), so a form that failed its own
    // validation (defaultPrevented) stays on the page
    document.addEventListener("submit", event => {
        if (event.defaultPrevented) return;
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const next = form.getAttribute("action");
        if (next && next !== "#") window.location.assign(next);
    });
}
