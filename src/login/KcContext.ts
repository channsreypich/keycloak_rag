/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { ExtendKcContext } from "keycloakify/login";
import type { KcEnvName, ThemeName } from "../kc.gen";

export type KcContextExtension = {
    themeName: ThemeName;
    properties: Record<KcEnvName, string> & {};
    // NOTE: Here you can declare more properties to extend the KcContext
    // See: https://docs.keycloakify.dev/faq-and-help/some-values-you-need-are-missing-from-in-kccontext
};

export type KcContextExtensionPerPage = {
    "login.ftl": {
        /**
         * Shown on the "Account Suspended" screen.
         * TODO(backend): plain Keycloak does not send this. It needs a small
         * Keycloak extension (or user attributes) that adds it to the page.
         * Until then it is only filled by the mock in stories.
         */
        suspension?: {
            reason: string;
            /** ISO date, e.g. "2026-10-08" */
            suspendedAt: string;
        };
        /**
         * Shown on the "Account Pending Deletion" screen (the user asked to
         * delete their account and it is waiting out the grace period).
         * TODO(backend): like `suspension`, plain Keycloak does not send this.
         */
        /**
         * Brute force detection details for the Sign in form.
         * TODO(backend): plain Keycloak hides these on purpose. Without them the
         * page still shows the lock (from Keycloak's "temporarily disabled"
         * message) using LOCKOUT_SECONDS, just without "N attempts left".
         */
        bruteForce?: {
            /** Failed attempts left before the temporary lock */
            attemptsLeft?: number;
            /** Seconds until sign-in is allowed again (> 0 means locked) */
            lockedForSeconds?: number;
        };
        pendingDeletion?: {
            /** ISO date of the permanent deletion, e.g. "2026-10-17" */
            deleteOn: string;
            /** Where "Restore account" goes (cancels the deletion) */
            restoreUrl: string;
        };
    };
};

export type KcContext = ExtendKcContext<KcContextExtension, KcContextExtensionPerPage>;
