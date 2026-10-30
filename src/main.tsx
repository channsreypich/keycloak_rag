import { createRoot } from "react-dom/client";
import { StrictMode, type ReactNode } from "react";
import { KcPage } from "./kc.gen";

// Mock mode: `npm run dev`, or the hosted preview site (`npm run build:preview`).
// The normal theme build (`npm run build-keycloak-theme`) never includes the mock files.
const isMockMode = import.meta.env.DEV || import.meta.env.VITE_PREVIEW === "true";

async function main() {
    // No Keycloak here, so use mock data (see src/login/dev-mock.ts).
    // In real Keycloak `window.kcContext` is already set and this is skipped.
    let previewMenu: ReactNode = null;
    if (isMockMode && !window.kcContext) {
        const { getDevKcContext, installMockSubmit } = await import("./login/dev-mock");
        const { PreviewMenu } = await import("./login/preview-menu");
        window.kcContext = getDevKcContext();
        installMockSubmit();
        previewMenu = <PreviewMenu />;
    }

    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            {!window.kcContext ? (
                <h1>No Keycloak Context</h1>
            ) : (
                <KcPage kcContext={window.kcContext} />
            )}
            {previewMenu}
        </StrictMode>
    );
}

main();
