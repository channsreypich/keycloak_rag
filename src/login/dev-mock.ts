// MOCK MODE ONLY: click through the theme with mock data, in `npm run dev`
// and on the hosted preview site (`npm run build:preview`).
// main.tsx loads this file only then, and only when Keycloak did not give a
// real `window.kcContext`. It is never part of the theme jar.
//
// Every screen and state is listed in the "Preview" menu (preview-menu.tsx).
// Open a screen:
//   /                                → Sign in
//   /login-actions/registration      → Sign up
//   /login-actions/reset-credentials → Forgot password
//   /?page=login-otp.ftl             → any page id
//   /?state=suspended                → a page variant (see SCREENS in preview-menu.tsx)
// Sign in with an email that starts with "admin" → Set up MFA → admin pages.

import type { KcContext } from "./KcContext";
import {
    getKcContextMock,
    MOCK_EMAIL,
    mockFieldErrors,
    mockSocialProviders
} from "./KcPageStory";

/** Where "signed in" sends you: the RAGStudio web app. */
const APP_URL = import.meta.env.VITE_APP_URL ?? "http://localhost:3000";
const DASHBOARD_URL = `${APP_URL}/dashboard`;
const ADMIN_URL = `${APP_URL}/admin`;
const NEW_CHATBOT_URL = `${APP_URL}/chatbots/new`;

/** MFA is for admins only, so the mock admin sign-in goes to MFA setup first. */
const ADMIN_MFA_URL = "/?page=login-config-totp.ftl";

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
    // Google / GitHub = signed in
    const social = {
        displayInfo: true,
        providers: mockSocialProviders.map(p => ({ ...p, loginUrl: DASHBOARD_URL }))
    };

    switch (pageId) {
        case "login.ftl": {
            const base = {
                social,
                realm: {
                    rememberMe: true,
                    resetPasswordAllowed: true,
                    registrationAllowed: true
                },
                login: { rememberMe: "on" },
                // Submitting the form = signed in
                url: { loginAction: DASHBOARD_URL }
            };
            if (state === "wrong-password") {
                return {
                    ...base,
                    login: { username: MOCK_EMAIL },
                    message: { type: "error", summary: "Invalid username or password." },
                    messagesPerField: mockFieldErrors({
                        username: "Invalid username or password."
                    })
                };
            }
            if (state === "suspended") {
                return {
                    ...base,
                    login: { username: MOCK_EMAIL },
                    message: {
                        type: "error",
                        summary: "Account is disabled, contact your administrator."
                    },
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
                        summary:
                            "Account is temporarily disabled; contact your administrator or retry later."
                    },
                    bruteForce: { lockedForSeconds: 119 }
                };
            }
            if (state === "attempts-left") {
                return {
                    ...base,
                    login: { username: MOCK_EMAIL },
                    message: { type: "error", summary: "Invalid username or password." },
                    messagesPerField: mockFieldErrors({
                        username: "Invalid username or password."
                    }),
                    bruteForce: { attemptsLeft: 3 }
                };
            }
            if (state === "pending-deletion") {
                const deleteOn = new Date(Date.now() + 7 * 86_400_000)
                    .toISOString()
                    .slice(0, 10);
                return {
                    ...base,
                    pendingDeletion: { deleteOn, restoreUrl: DASHBOARD_URL }
                };
            }
            if (state === "email-sent") {
                return {
                    ...base,
                    auth: { attemptedUsername: MOCK_EMAIL },
                    message: {
                        type: "success",
                        summary:
                            "You should receive an email shortly with further instructions."
                    }
                };
            }
            return base;
        }
        case "register.ftl": {
            const base = {
                social,
                url: { registrationAction: "/?page=login-verify-email.ftl" }
            };
            if (state === "email-taken") {
                return {
                    ...base,
                    profile: {
                        attributesByName: {
                            firstName: { value: "Chann" },
                            lastName: { value: "Sreypich" },
                            email: { value: MOCK_EMAIL }
                        }
                    },
                    messagesPerField: mockFieldErrors({ email: "Email already exists." })
                };
            }
            return base;
        }
        case "login-verify-email.ftl":
            return {
                user: { email: MOCK_EMAIL },
                message: {
                    type: "warning",
                    summary:
                        "You need to verify your email address to activate your account."
                },
                // "Resend email" stays on this page
                url: { loginAction: "/?page=login-verify-email.ftl" }
            };
        case "login-update-password.ftl":
            return {
                auth: { attemptedUsername: MOCK_EMAIL },
                url: { loginAction: DASHBOARD_URL }
            };
        case "error.ftl":
            if (state === "no-account") {
                return {
                    message: {
                        type: "error",
                        summary: `User ${MOCK_EMAIL} authenticated with identity provider google does not exist. Please contact your administrator.`
                    }
                };
            }
            if (state === "verify-link-expired") {
                return {
                    auth: { attemptedUsername: MOCK_EMAIL },
                    message: {
                        type: "error",
                        summary: "Action expired. Please continue with login now."
                    }
                };
            }
            {
                // Real Keycloak texts, so the error page can show its friendly version
                const summaries: Record<string, string> = {
                    "setup-problem": "Invalid parameter: redirect_uri",
                    cookies:
                        "Cookie not found. Please make sure cookies are enabled in your browser.",
                    "timed-out":
                        "Your login attempt timed out.  Login will start from the beginning."
                };
                return {
                    client: { baseUrl: DASHBOARD_URL },
                    message: {
                        type: "error",
                        summary: summaries[state ?? ""] ?? "Unexpected error"
                    }
                };
            }
        case "info.ftl":
            // The designed info screen: "Email Verified" (after clicking the email link)
            return {
                auth: { attemptedUsername: MOCK_EMAIL },
                message: {
                    type: "success",
                    summary: "Your email address has been verified."
                },
                pageRedirectUri: NEW_CHATBOT_URL,
                url: {}
            };
        case "login-reset-password.ftl":
            if (state === "link-expired") {
                return {
                    message: {
                        type: "error",
                        summary: "Action expired. Please continue with login now."
                    }
                };
            }
            return { url: { loginAction: `${LOGIN_URL}?state=email-sent` } };
        case "login-config-totp.ftl":
        case "login-otp.ftl": {
            // MFA is for admins only: finishing it = signed in as admin
            const base = { url: { loginAction: ADMIN_URL } };
            if (state === "wrong-code") {
                return {
                    ...base,
                    messagesPerField: mockFieldErrors({
                        totp: "Invalid authenticator code."
                    })
                };
            }
            return base;
        }
        default:
            // Update password, page expired, ...: finishing the form = signed in
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
        const username = new FormData(form).get("username");
        const isAdmin =
            form.id === "kc-form-login" &&
            typeof username === "string" &&
            username.trim().startsWith("admin");
        const next = isAdmin ? ADMIN_MFA_URL : form.getAttribute("action");
        if (next && next !== "#") window.location.assign(next);
    });
}
