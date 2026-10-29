// Fixed values shown in the UI. Keep them in sync with the realm settings.

/** Realm → Tokens → "Forgot password" action token lifespan. */
export const RESET_LINK_MINUTES = 15;

/**
 * Realm → Security defenses → Brute force detection → "Wait increment".
 * Used for the "Locked · try again in 02:00" countdown when the backend
 * does not send the exact time left (`bruteForce.lockedForSeconds`).
 */
export const LOCKOUT_SECONDS = 120;

/** TODO(team): real support address or page. */
export const SUPPORT_URL = "mailto:support@ragstudio.app";

/** Authenticator apps named on the "Set Up Authenticator" page. */
export const AUTHENTICATOR_APPS = "Google Authenticator, Microsoft Authenticator or 1Password";
