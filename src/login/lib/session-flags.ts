// Keycloak does not tell a page how the user got there. We remember a small note
// in this browser tab instead. If storage is blocked, the pages show their normal text.

const PREFIX = "ragstudio:";

/** Set when the sign-up form is sent, so "Verify Email" knows the user just signed up. */
export const SIGNED_UP = "signed-up";
/** Set when a new password is sent, so the next page can say "Password updated". */
export const PASSWORD_SENT = "password-sent";
/** Holds the email while the sign-in form is being sent, so the next page knows the result. */
export const SIGN_IN_SENT = "sign-in-sent";
/** Holds the provider name ("Google") while the user links a Google/GitHub account. */
export const LINKING_PROVIDER = "linking-provider";

export function setFlag(name: string, value = "1") {
    try {
        sessionStorage.setItem(PREFIX + name, value);
    } catch {
        // Storage blocked
    }
}

export function getFlag(name: string): string | null {
    try {
        return sessionStorage.getItem(PREFIX + name);
    } catch {
        return null;
    }
}

export function clearFlag(name: string) {
    try {
        sessionStorage.removeItem(PREFIX + name);
    } catch {
        // Storage blocked
    }
}
