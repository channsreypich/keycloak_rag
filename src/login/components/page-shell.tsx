import { useEffect, type ReactNode } from "react";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { KcContext } from "../KcContext";
import { LiquidBackground } from "./liquid-background";
import { useGlassPanels } from "../lib/glass-panels";
// Loaded here (not in main.tsx) so Keycloak's default pages keep their own CSS
import "../../index.css";

/**
 * Wraps every page: runs Keycloak's page setup (scripts, "signed in on
 * another tab" check), sets the tab title and draws the lavender background.
 */
export function PageShell(props: {
    kcContext: KcContext;
    title: string;
    children: ReactNode;
}) {
    const { kcContext, title, children } = props;

    useEffect(() => {
        document.title = `${title} · RAGStudio`;
    }, [title]);

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss: false });
    // Hover light on the glass boxes inside the card
    useGlassPanels();

    if (!isReadyToRender) {
        return null;
    }

    return (
        <div className="relative isolate min-h-dvh overflow-hidden bg-auth">
            {/* Soft blobs behind the card, slowly drifting */}
            <LiquidBackground />
            {children}
        </div>
    );
}
