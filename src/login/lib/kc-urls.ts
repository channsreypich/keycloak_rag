import { ADMIN_CLIENT_ID } from "./constants";

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
 * The web app's sign-in route, built from the Keycloak client's "Home URL".
 * It opens sign in, then sends the user to `nextPath`, or to their dashboard.
 * Undefined when the client has no Home URL.
 */
export function appSignInUrl(client: AppClient, nextPath?: string): string | undefined {
    const path = client?.clientId === ADMIN_CLIENT_ID ? "/auth/admin-sign-in" : "/auth/sign-in";
    return appUrl(client, nextPath ? `${path}?next=${encodeURIComponent(nextPath)}` : path);
}

/**
 * The web app's sign-up route. Starting sign up there sends the new user
 * to Get Started after they verify their email.
 * Undefined when the client has no Home URL.
 */
export function appSignUpUrl(client: AppClient): string | undefined {
    return appUrl(client, "/auth/sign-up");
}

type AppClient = { clientId?: string; baseUrl?: string } | undefined;

function appUrl(client: AppClient, path: string): string | undefined {
    if (!client?.baseUrl) return undefined;
    try {
        return new URL(path, client.baseUrl).href;
    } catch {
        return undefined;
    }
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
