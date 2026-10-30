// Keycloak's error page shows technical text like "Invalid parameter: redirect_uri".
// Users can't do anything with that, so we show a friendly title and text instead.
// The original text is still logged in the browser console for developers.

import type { I18n } from "../i18n";

type MessageKey = Parameters<I18n["msgStr"]>[0];
type FriendlyError = { title: string; text: string };

const SETUP_PROBLEM: FriendlyError = {
    title: "Sign-in Isn’t Available Right Now",
    text: "There’s a problem on our side, not with your account. Please try again later, or contact support if it keeps happening."
};

const TIMED_OUT: FriendlyError = {
    title: "Your Sign-in Timed Out",
    text: "For your security, sign-in pages expire after a while. Please sign in again."
};

/** Shown for any error that is not in the list below. */
export const GENERIC_ERROR: FriendlyError = {
    title: "Something Went Wrong",
    text: "We couldn’t finish signing you in. Please go back to RAGStudio and try again."
};

/** Keycloak message keys (see keycloakify messages_defaultSet/en.ts) and what we show instead. */
const FRIENDLY_ERRORS: { keys: MessageKey[]; error: FriendlyError }[] = [
    {
        // Wrong app or realm settings (e.g. a redirect URL that is not allowed)
        keys: [
            "invalidParameterMessage",
            "missingParameterMessage",
            "invalidRedirectUriMessage",
            "invalidRequestMessage",
            "clientNotFoundMessage",
            "clientDisabledMessage",
            "unknownLoginRequesterMessage",
            "loginRequesterNotEnabledMessage",
            "bearerOnlyMessage",
            "standardFlowDisabledMessage",
            "implicitFlowDisabledMessage"
        ],
        error: SETUP_PROBLEM
    },
    {
        keys: [
            "loginTimeout",
            "expiredCodeMessage",
            "staleCodeMessage",
            "invalidCodeMessage",
            "sessionNotActiveMessage"
        ],
        error: TIMED_OUT
    },
    {
        keys: ["cookieNotFoundMessage"],
        error: {
            title: "Cookies Are Turned Off",
            text: "RAGStudio needs cookies to sign you in. Turn on cookies in your browser, then try again."
        }
    },
    {
        keys: ["alreadyLoggedIn"],
        error: {
            title: "You’re Already Signed In",
            text: "Go back to RAGStudio to continue."
        }
    },
    {
        keys: ["differentUserAuthenticated"],
        error: {
            title: "Another Account Is Signed In",
            text: "Someone else is already signed in on this browser. Sign out of that account first, then try again."
        }
    },
    {
        keys: [
            "identityProviderUnexpectedErrorMessage",
            "identityProviderNotFoundMessage"
        ],
        error: {
            title: "Couldn’t Sign In With Google or GitHub",
            text: "Please try again, or sign in with your email and password instead."
        }
    },
    {
        keys: ["invalidTokenRequiredActions"],
        error: {
            title: "Link No Longer Valid",
            text: "This link can’t be used any more. Please request a new one."
        }
    }
];

/**
 * True when `summary` was made from this message key. Messages like
 * "Invalid parameter: {0}" are matched on the text before the {0}.
 */
function isMessage(summary: string, key: MessageKey, msgStr: I18n["msgStr"]) {
    const marker = "\u0000";
    const [before] = msgStr(key, marker).split(marker);
    return before.trim() !== "" && summary.startsWith(before.trim());
}

/** Friendly title and text for a Keycloak error message. */
export function getFriendlyError(summary: string, msgStr: I18n["msgStr"]): FriendlyError {
    const match = FRIENDLY_ERRORS.find(({ keys }) =>
        keys.some(key => isMessage(summary, key, msgStr))
    );
    return match?.error ?? GENERIC_ERROR;
}
