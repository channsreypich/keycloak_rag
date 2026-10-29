// Keycloak does not give every page every URL. These helpers build the
// missing ones from `url.loginUrl`, which looks like:
//   /realms/<realm>/login-actions/authenticate?client_id=...&tab_id=...

type LoginAction = "registration" | "reset-credentials";

export function loginActionUrl(loginUrl: string, action: LoginAction): string {
    return loginUrl.includes("/login-actions/authenticate")
        ? loginUrl.replace("/login-actions/authenticate", `/login-actions/${action}`)
        : loginUrl;
}

/**
 * Reads the type of the emailed link ("verify-email", "reset-credentials", ...)
 * from the `key` query param, so an "expired" page can show the right text.
 * The key is a JWT; we only read its payload, we never trust it for security.
 */
export function getActionTokenType(): string | undefined {
    try {
        const key = new URLSearchParams(window.location.search).get("key");
        if (!key) return undefined;
        const payload = key.split(".")[1];
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        const typ = (JSON.parse(json) as { typ?: unknown }).typ;
        return typeof typ === "string" ? typ : undefined;
    } catch {
        return undefined;
    }
}
