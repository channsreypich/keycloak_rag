// Makes the email previews that Storybook shows (Emails/...).
//
// Email templates are FreeMarker (.ftl): only Keycloak can fill them in, so a
// browser cannot show them directly. This script starts a throwaway Keycloak
// with the built theme jar and a Mailpit inbox (Docker), sends each email with
// sample data, and saves the HTML Keycloak made to email-preview/.
//
// Run: npm run preview-emails   (builds the theme first; needs Docker)
// Then reload Storybook (src/email-stories/ imports the files). Commit
// email-preview/ so others see it without Docker.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "email-preview");
const JAR = join(ROOT, "dist_keycloak", "keycloak-theme-for-kc-all-other-versions.jar");
const KEYCLOAK_IMAGE = "quay.io/keycloak/keycloak:26.4.0";
const MAILPIT_IMAGE = "axllent/mailpit:v1.24";

// Fixed names and ports, so a run left behind is cleaned up by the next one.
const NETWORK = "rs-email-preview";
const KC = "rs-email-preview-kc";
const MAIL = "rs-email-preview-mailpit";
const KC_URL = "http://localhost:8091";
const MAIL_URL = "http://localhost:8027";
const REALM = "ragstudio";

/** Sample person shown in the previews. */
const USER = { username: "chhun", email: "chhun@example.com", firstName: "Chhun", lastName: "Sample" };

/**
 * One entry per email. `send` asks Keycloak to send it; `file` is the preview
 * name Storybook loads. Add an entry here when a new email is designed.
 */
const EMAILS = [
    {
        file: "email-verification.html",
        // lifespan=300: a 5 minute link, like the design.
        send: (admin, userId) => call(admin, "PUT", `/admin/realms/${REALM}/users/${userId}/send-verify-email?lifespan=300`)
    },
    {
        file: "password-reset.html",
        // The real "Forgot password?" form. The link lifespan is the realm's
        // actionTokenGeneratedByUserLifespan (5 minutes, set below).
        send: () => forgotPassword(USER.username)
    }
];

const docker = (...args) => execFileSync("docker", args, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function cleanUp() {
    for (const name of [KC, MAIL]) {
        try {
            docker("rm", "-f", name);
        } catch {
            // Not running.
        }
    }
    try {
        docker("network", "rm", NETWORK);
    } catch {
        // Not there.
    }
}

async function waitFor(url, what) {
    for (let i = 0; i < 90; i++) {
        try {
            if ((await fetch(url)).ok) return;
        } catch {
            // Not up yet.
        }
        await sleep(2000);
    }
    throw new Error(`${what} did not start (${url})`);
}

async function call(token, method, path, body) {
    const response = await fetch(KC_URL + path, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`${method} ${path} -> ${response.status} ${await response.text()}`);
    return response;
}

/**
 * Fills in "Forgot password?" like a person would. The throwaway realm uses
 * Keycloak's plain login theme, so the form is ordinary HTML.
 */
async function forgotPassword(username) {
    const cookies = new Map();
    const keep = response => {
        for (const line of response.headers.getSetCookie()) {
            const [pair] = line.split(";");
            const at = pair.indexOf("=");
            cookies.set(pair.slice(0, at), pair.slice(at + 1));
        }
    };
    const cookieHeader = () => [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");

    const page = await fetch(`${KC_URL}/realms/${REALM}/login-actions/reset-credentials?client_id=account-console`);
    keep(page);
    const action = /<form[^>]*action="([^"]+)"/.exec(await page.text())?.[1]?.replaceAll("&amp;", "&");
    if (!action) throw new Error("no form on the forgot password page");

    const sent = await fetch(action, {
        method: "POST",
        redirect: "manual",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookieHeader() },
        body: new URLSearchParams({ username })
    });
    if (sent.status >= 400) throw new Error(`forgot password -> ${sent.status}`);
}

async function adminToken() {
    const response = await fetch(`${KC_URL}/realms/master/protocol/openid-connect/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "password", client_id: "admin-cli", username: "admin", password: "admin" })
    });
    if (!response.ok) throw new Error(`admin token -> ${response.status} ${await response.text()}`);
    return (await response.json()).access_token;
}

/** Waits for the next email in Mailpit and returns its HTML. */
async function nextEmailHtml(seen) {
    for (let i = 0; i < 30; i++) {
        const { messages } = await (await fetch(`${MAIL_URL}/api/v1/messages`)).json();
        const fresh = messages.find(m => !seen.has(m.ID));
        if (fresh) {
            seen.add(fresh.ID);
            return (await (await fetch(`${MAIL_URL}/api/v1/message/${fresh.ID}`)).json()).HTML;
        }
        await sleep(500);
    }
    throw new Error("no email arrived in Mailpit");
}

async function main() {
    cleanUp();
    docker("network", "create", NETWORK);
    docker("run", "-d", "--name", MAIL, "--network", NETWORK, "-p", "8027:8025", MAILPIT_IMAGE);
    docker(
        "run", "-d", "--name", KC, "--network", NETWORK, "-p", "8091:8080",
        "-e", "KC_BOOTSTRAP_ADMIN_USERNAME=admin", "-e", "KC_BOOTSTRAP_ADMIN_PASSWORD=admin",
        "-v", `${JAR}:/opt/keycloak/providers/ragstudio-theme.jar:ro`,
        KEYCLOAK_IMAGE, "start-dev"
    );
    console.log("Starting Keycloak (about 30 s)...");
    await waitFor(`${KC_URL}/realms/master`, "Keycloak");
    await waitFor(`${MAIL_URL}/api/v1/messages`, "Mailpit");

    // Throwaway container only: allow plain HTTP from outside it.
    const kcadm = "/opt/keycloak/bin/kcadm.sh";
    docker("exec", KC, kcadm, "config", "credentials", "--server", "http://localhost:8080",
        "--realm", "master", "--user", "admin", "--password", "admin");
    docker("exec", KC, kcadm, "update", "realms/master", "-s", "sslRequired=NONE");

    const admin = await adminToken();
    await call(admin, "POST", "/admin/realms", {
        realm: REALM,
        displayName: "RAGStudio",
        enabled: true,
        sslRequired: "none",
        emailTheme: "ragstudio",
        // Plain login pages, so forgotPassword() can read the form.
        loginTheme: "keycloak",
        resetPasswordAllowed: true,
        actionTokenGeneratedByUserLifespan: 300,
        smtpServer: { host: MAIL, port: "1025", from: "no-reply@ragstudio.test", fromDisplayName: "RAGStudio" }
    });
    const created = await call(admin, "POST", `/admin/realms/${REALM}/users`, {
        ...USER,
        enabled: true,
        emailVerified: true,
        credentials: [{ type: "password", value: "Sample-pass-1", temporary: false }]
    });
    const userId = created.headers.get("location").split("/").pop();

    mkdirSync(OUT, { recursive: true });
    const seen = new Set();
    for (const email of EMAILS) {
        await email.send(admin, userId);
        const html = (await nextEmailHtml(seen))
            // Images: Storybook swaps these for src/email/resources/img (email-preview.tsx).
            .replace(/https?:\/\/[^"']+\/email\/ragstudio\/img\//g, "img/")
            // Links: the throwaway Keycloak is gone after this run.
            .replaceAll(KC_URL, "https://auth.example.com");
        writeFileSync(join(OUT, email.file), html);
        console.log(`Saved email-preview/${email.file}`);
    }
}

try {
    await main();
} finally {
    cleanUp();
}
