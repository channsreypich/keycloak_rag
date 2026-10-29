import { useEffect, type ReactNode } from "react";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { KcContext } from "../KcContext";
// Loaded here (not in main.tsx) so Keycloak's default pages keep their own CSS
import "../../index.css";

/**
 * Wraps every page: runs Keycloak's page setup (scripts, "signed in on
 * another tab" check), sets the tab title and draws the lavender background.
 */
export function PageShell(props: { kcContext: KcContext; title: string; children: ReactNode }) {
    const { kcContext, title, children } = props;

    useEffect(() => {
        document.title = `${title} · RAGStudio`;
    }, [title]);

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss: false });

    if (!isReadyToRender) {
        return null;
    }

    return (
        <div className="relative isolate min-h-dvh overflow-hidden bg-auth">
            {/* Soft blobs behind the card */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 left-1/6 size-96 rounded-full bg-auth-blob opacity-80 blur-3xl" />
                <div className="absolute right-1/12 -bottom-32 size-112 rounded-full bg-auth-blob opacity-70 blur-3xl" />
                <div className="absolute bottom-1/10 left-1/12 size-80 rounded-full bg-card opacity-60 blur-3xl" />
            </div>
            {children}
        </div>
    );
}
