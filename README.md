# RAGStudio Keycloak theme

Login theme for RAGStudio (sign in, sign up, verify email, MFA, forgot / reset
password, account suspended, link expired). Built with
[Keycloakify](https://docs.keycloakify.dev) + React + Tailwind CSS v4.
Design tokens are copied from `ragstudio-web-ui/src/app/globals.css`.

## Develop

```bash
npm install
npm run storybook        # http://localhost:6006, every screen with mock data
```

Pages live in `src/login/pages/`, shared pieces in `src/login/components/`.

### Click-through mock (with the web app)

```bash
npm run dev              # http://localhost:5173, mock data from src/login/dev-mock.ts
```

The web app's Sign in / Sign up buttons open this server (see
`ragstudio-web-ui/src/constants/auth.ts`). Forms go to the next mock screen,
and signing in goes to http://localhost:3000/dashboard.

- Any page: `/?page=login-otp.ftl`, `/?page=login-config-totp.ftl`, ...
- Sign in variants: `/?state=wrong-password`, `/?state=suspended`, `/?state=email-sent`

The mock only runs in dev. Inside real Keycloak, Keycloak gives the data and
the mock is not in the build.

## Build

```bash
npm run build-keycloak-theme   # needs Java + Maven
```

Output in `dist_keycloak/`:

| Keycloak version | File |
| ---------------- | ------------------------------------------- |
| 26 and newer     | `keycloak-theme-for-kc-all-other-versions.jar` |
| 22 – 25          | `keycloak-theme-for-kc-22-to-25.jar`           |

## Install (backend team)

1. Copy the right `.jar` into Keycloak's `providers/` folder
   (Docker: mount it to `/opt/keycloak/providers/`).
2. Restart Keycloak (run `kc.sh build` first if you use an optimized image).
3. Admin console → realm `ragstudio` → **Realm settings → Themes → Login theme** → `ragstudio` → Save.

## Extension: end the lock after a password reset

Keycloak only removes a sign-in lock when the reset link opens in the same browser.
This small extension also removes it when the link opens in another browser.

1. Build it with the same Keycloak version as the server:
   `mvn -f extensions/clear-lock-on-reset/pom.xml -Dkeycloak.version=<version> package`
2. Copy `extensions/clear-lock-on-reset/target/clear-lock-on-reset.jar` into Keycloak's `providers/` folder and restart.
3. Admin console → realm `ragstudio` → **Realm settings → Events → Event listeners** → add `ragstudio-clear-lock-on-reset` → Save.

## Extension: "No Account Found" on Google/GitHub sign in

Keycloak creates a new account by default. With this extension, only sign up creates
one. Sign in with no account shows "No Account Found". Needed only with Google/GitHub on.

1. Build it with the same Keycloak version as the server:
   `mvn -f extensions/block-new-social-sign-in/pom.xml -Dkeycloak.version=<version> package`
2. Copy `extensions/block-new-social-sign-in/target/block-new-social-sign-in.jar` into Keycloak's `providers/` folder and restart.
3. Authentication → Flows → `first broker login` → Duplicate, named `ragstudio first broker login`.
4. In the copy, add the step `RAGStudio: block new accounts on social sign in`, set it to **Required**, and move it to the **top**, above Review Profile.
5. In the copy, set **Verify existing account by Email** to **Disabled**, so an existing account goes straight to the Link Account password step.
6. Each identity provider (`google`, `github`) → **First login flow override** → `ragstudio first broker login`.

The web app's Home URL must be set too, because "Create an account" has to open the web app's sign-up route.

## Realm settings the theme expects

- Clients `ragstudio-web` and `ragstudio-admin`: set **Home URL** to the web app (for example `https://app.ragstudio-kshrd.site`). The redirects after verify email and reset password need it.
- Realm display name: `RAGStudio`
- Login: email as username ON, verify email ON, forgot password ON, remember me ON
- Authentication → Flows → `registration` → Password Validation → settings: **Always set password on register form** ON. Newer Keycloak (seen on 26.8.1) has this OFF by default. With verify email on, it then ignores the password on the Sign Up form and shows Reset Password after the email link.
- Realm settings → Themes → Email theme: leave empty. This theme has no email templates.
- User profile: `lastName` not required (the form has one "Full name" box)
- Password policy: length(8), maxLength(64), notEmail
- Tokens: forgot-password action lifespan 15 minutes (matches the UI text)
- Security defenses → Brute force detection: Strategy Linear, Max login failures 5, Wait increment 1 minute, Max wait 15 minutes, so 5 wrong = 1 minute, 6 = 2 minutes, 7 = 3 minutes, up to 15 (the Sign In countdown uses the same numbers, see `src/login/lib/login-lock.ts`)
- Authentication: authenticator app required for the `ADMIN` role, optional for users. Duplicate the `browser` flow and bind the copy:
  1. In the copy's `Browser - Conditional OTP` subflow (called `Browser - Conditional 2FA` on newer Keycloak such as 26.8.1), add **Condition - user role** (Required): role `ADMIN`, **Negate output** ON. That subflow is now for users who set up MFA themselves.
  2. In the copy's `forms` subflow, add a new subflow (Conditional) with **Condition - user role** (Required, role `ADMIN`) and **OTP Form** (Required). This asks admins for a code, and makes them set up the app first if they have none.
  3. Action → Bind flow → Browser flow.
- Authentication: password reset must keep the authenticator app. Keycloak's default `Reset OTP` step makes the user set up a **new** app. Do not just disable it: then the emailed link alone signs an admin in with no code. Duplicate the `reset credentials` flow and bind the copy:
  1. In the copy's `Reset - Conditional OTP` subflow (also check for `Conditional 2FA`), delete **Reset OTP**. Add **OTP Form** (Required) and **Condition - user role** (Required): role `ADMIN`, **Negate output** ON.
  2. At the top level of the copy, add a new subflow (Conditional) with **Condition - user role** (Required, role `ADMIN`) and **OTP Form** (Required).
  3. Action → Bind flow → Reset credentials flow.
- Client `ragstudio-admin`: confidential, PKCE S256, redirect URI `<app URL>/api/auth/callback/keycloak-admin`. The web app needs `AUTH_KEYCLOAK_ADMIN_ID` and `AUTH_KEYCLOAK_ADMIN_SECRET` to use it.
- Email (SMTP) set up, so verify / reset emails are sent
- Identity providers `google` and `github` (optional; buttons hide without them)

## Known gaps

- "Account suspended" reason and date need a Keycloak extension; without it
  the reason box is hidden.
- Pages not designed yet (IdP account linking, terms, logout confirm, ...)
  use the default Keycloak look.
- No email templates yet.
