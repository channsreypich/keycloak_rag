import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { keycloakify } from "keycloakify/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    // Fixed port: the web app's Sign in / Sign up links point here in dev
    server: { port: 5173, strictPort: true },
    plugins: [
        react(),
        tailwindcss(),
        keycloakify({
            // Name shown in Keycloak: Realm settings → Themes → Login theme
            themeName: "ragstudio",
            accountThemeImplementation: "none"
        })
    ]
});
