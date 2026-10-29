import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { KcPage } from "./kc.gen";

async function main() {
    // `npm run dev`: no Keycloak here, so use mock data (see src/login/dev-mock.ts).
    // In real Keycloak `window.kcContext` is already set and this is skipped.
    if (import.meta.env.DEV && !window.kcContext) {
        const { getDevKcContext, installMockSubmit } = await import("./login/dev-mock");
        window.kcContext = getDevKcContext();
        installMockSubmit();
    }

    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            {!window.kcContext ? <h1>No Keycloak Context</h1> : <KcPage kcContext={window.kcContext} />}
        </StrictMode>
    );
}

main();
