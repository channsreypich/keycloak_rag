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

## Realm settings the theme expects

- Realm display name: `RAGStudio`
- Login: email as username ON, verify email ON, forgot password ON, remember me ON
- User profile: `lastName` not required (the form has one "Full name" box)
- Password policy: length(8), maxLength(64), notEmail
- Tokens: forgot-password action lifespan 15 minutes (matches the UI text)
- Authentication: OTP required for the `admin` role
- Email (SMTP) set up, so verify / reset emails are sent
- Identity providers `google` and `github` (optional; buttons hide without them)

## Known gaps

- "Account suspended" reason and date need a Keycloak extension; without it
  the reason box is hidden.
- Pages not designed yet (IdP account linking, terms, logout confirm, ...)
  use the default Keycloak look.
- No email templates yet.
