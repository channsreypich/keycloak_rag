import { useState, type FormEvent } from "react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { FormMessage } from "../components/form-message";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { SocialButtons } from "../components/social-buttons";
import { SplitLayout } from "../components/split-layout";
import { PasswordField, TextField } from "../components/text-field";
import { ADMIN_CLIENT_ID } from "../lib/constants";
import { formatSeconds } from "../lib/countdown";
import { appSignUpUrl } from "../lib/kc-urls";
import {
    activeLockEmail,
    attemptsLeftFor,
    clearLock,
    recordServerLock,
    recordWrongPassword,
    useLockSeconds
} from "../lib/login-lock";
import { clearFlag, getFlag, LINKING_PROVIDER, setFlag, SIGN_IN_SENT } from "../lib/session-flags";
import { getEmailError, getEmailTypingError } from "../lib/validation";
import { AccountPendingDeletion } from "./account-pending-deletion";
import { AccountSuspended } from "./account-suspended";
import { CheckEmail } from "./check-email";
import { LinkAccount } from "./link-account";
import { providerDisplayName } from "./no-account-found";

type Props = { kcContext: Extract<KcContext, { pageId: "login.ftl" }>; i18n: I18n };

/** How Keycloak names its "enter your password to link an account" step. */
const IDP_REAUTH_FORM = "idp-username-password-form-display-name";

/**
 * login.ftl. Keycloak also uses this page for two other screens:
 * - account disabled  → "Account Suspended"
 * - reset email sent  → "Check Your Email"
 * And, when the backend sends `pendingDeletion`, "Restore your account?".
 */
export default function Login(props: Props) {
    const { kcContext, i18n } = props;
    const { url, message, login, auth } = kcContext;
    const { msgStr } = i18n;

    const email = login.username || auth?.attemptedUsername;

    if (kcContext.pendingDeletion) {
        return (
            <PageShell kcContext={kcContext} title="Restore your account">
                <AccountPendingDeletion
                    email={email}
                    message={message}
                    signOutUrl={url.loginRestartFlowUrl}
                    pendingDeletion={kcContext.pendingDeletion}
                />
            </PageShell>
        );
    }

    // Keycloak asks for the password here before linking a Google/GitHub account
    // (Keycloak sends authenticationSelections, but Keycloakify's types leave it out)
    const steps = (auth as { authenticationSelections?: { displayName: string }[] } | undefined)?.authenticationSelections;
    const isLinking = steps?.some(item => item.displayName === IDP_REAUTH_FORM);
    if (isLinking) {
        // The message names the provider. A wrong password replaces the message,
        // so remember the name from the first try.
        const linkPrefix = msgStr("federatedIdentityConfirmReauthenticateMessage", "").trim();
        if (message?.summary.startsWith(linkPrefix)) {
            setFlag(LINKING_PROVIDER, providerDisplayName(message.summary.slice(linkPrefix.length).trim()));
        }
        return (
            <PageShell kcContext={kcContext} title="Link Account">
                <LinkAccount kcContext={kcContext} provider={getFlag(LINKING_PROVIDER) ?? "your social account"} i18n={i18n} />
            </PageShell>
        );
    }

    if (message?.summary === msgStr("accountDisabledMessage")) {
        return (
            <PageShell kcContext={kcContext} title="Account Suspended">
                <AccountSuspended signInUrl={url.loginRestartFlowUrl} email={email} suspension={kcContext.suspension} />
            </PageShell>
        );
    }

    if (message?.summary === msgStr("emailSentMessage")) {
        return (
            <PageShell kcContext={kcContext} title="Check Your Email">
                <CheckEmail email={email} signInUrl={url.loginRestartFlowUrl} forgotPasswordUrl={url.loginResetCredentialsUrl} />
            </PageShell>
        );
    }

    return (
        <PageShell kcContext={kcContext} title={kcContext.client.clientId === ADMIN_CLIENT_ID ? "Admin Sign In" : "Sign In"}>
            <SignInForm {...props} />
        </PageShell>
    );
}

function SignInForm(props: Props) {
    const { kcContext, i18n } = props;
    const { realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField, message, social, bruteForce } = kcContext;

    // Opened from the web app's admin sign-in: email and password only (admins have no Google/GitHub)
    const isAdmin = kcContext.client.clientId === ADMIN_CLIENT_ID;

    const keycloakCredentialsError = messagesPerField.existsError("username", "password")
        ? messagesPerField.getFirstError("username", "password")
        : undefined;
    const isWrongPassword = keycloakCredentialsError === i18n.msgStr("invalidUserMessage");
    // Too many failed attempts: Keycloak's "temporarily disabled" message, or
    // the lock time sent by the backend (see `bruteForce` in KcContext.ts)
    const isServerLocked =
        message?.summary === i18n.msgStr("accountTemporarilyDisabledMessage") || (bruteForce?.lockedForSeconds ?? 0) > 0;

    const [username, setUsername] = useState(() => {
        // Runs once per page: read the result of the sign in that was just sent
        const sentEmail = getFlag(SIGN_IN_SENT);
        clearFlag(SIGN_IN_SENT);
        const email = login.username || sentEmail;
        if (email && isServerLocked) recordServerLock(email, bruteForce?.lockedForSeconds);
        else if (sentEmail && isWrongPassword) recordWrongPassword(sentEmail);
        // The last sign in did not come back with an error, so it worked
        else if (sentEmail) clearLock(sentEmail);
        return login.username || activeLockEmail() || "";
    });
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Empty or badly typed field errors, shown after the user presses "Sign in"
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

    const lockLeft = useLockSeconds(username);
    const locked = lockLeft > 0;

    const attemptsLeft = bruteForce?.attemptsLeft ?? attemptsLeftFor(username);
    // People sign in with their email, so say "email" instead of Keycloak's "username".
    // Keycloak's "locked" text is replaced by our own while locked, and is old news after that.
    const serverCredentialsError = isServerLocked
        ? undefined
        : isWrongPassword
          ? "Invalid email or password."
          : keycloakCredentialsError;
    const credentialsError = locked
        ? "Too many failed attempts. Sign-in is locked for a short time."
        : serverCredentialsError && attemptsLeft !== undefined
          ? `${serverCredentialsError.replace(/\.?$/, ".")} ${attemptsLeft} ${attemptsLeft === 1 ? "attempt" : "attempts"} left before a temporary lock.`
          : serverCredentialsError;

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const next = {
            username: usernameHidden ? undefined : getEmailError(username),
            password: !password ? "Please enter your password." : undefined
        };
        if (next.username || next.password) {
            event.preventDefault();
            setErrors(next);
            document.getElementById(next.username ? "username" : "password")?.focus();
            return;
        }
        setFlag(SIGN_IN_SENT, username.trim());
        setIsSubmitting(true);
    };

    return (
        <SplitLayout panelSide="right">
            <PageHeader
                align="left"
                eyebrow={isAdmin ? "Admin console" : undefined}
                title={isAdmin ? "Admin sign-in" : "Sign In"}
                subtitle={
                    isAdmin
                        ? "Welcome back. Sign in to manage users, models and chatbots."
                        : "Welcome back. Sign in to manage your chatbots and knowledge bases."
                }
            />

            {!isAdmin && !locked && <SocialButtons providers={social?.providers} dividerText="or sign in with email" />}

            {/* The field error below already explains bad credentials and locks */}
            {!credentialsError && !isServerLocked && <FormMessage message={message} />}

            {realm.password && (
                <form id="kc-form-login" action={url.loginAction} method="post" noValidate onSubmit={onSubmit} className="space-y-4 tall:space-y-6">
                    {!usernameHidden && (
                        <TextField
                            id="username"
                            name="username"
                            label="Email"
                            type="text"
                            inputMode="email"
                            autoComplete="username"
                            // After a wrong password the cursor goes to the password box.
                            // A box with the cursor is not red, so this also keeps the email box red.
                            autoFocus={!credentialsError || locked}
                            placeholder={isAdmin ? "you@company.com" : "Enter your username or email"}
                            plainLabel={isAdmin}
                            value={username}
                            onChange={e => {
                                setUsername(e.target.value);
                                setErrors(prev => ({ ...prev, username: undefined }));
                            }}
                            error={errors.username ?? getEmailTypingError(username)}
                            // While locked only the password box is red (the lock is about the password)
                            invalid={!!credentialsError && !locked}
                        />
                    )}

                    <PasswordField
                        id="password"
                        name="password"
                        label="Password"
                        plainLabel={isAdmin}
                        autoComplete="current-password"
                        autoFocus={!!credentialsError && !locked}
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value);
                            setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        error={errors.password ?? credentialsError}
                        labelAside={
                            realm.resetPasswordAllowed && (
                                <a href={url.loginResetCredentialsUrl} className="text-p3 text-ink-secondary hover:text-ink hover:underline">
                                    Forgot password?
                                </a>
                            )
                        }
                    />

                    {realm.rememberMe && !usernameHidden && !locked && (
                        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-p3 text-ink-body">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                name="rememberMe"
                                // Ticked by default, like the design
                                defaultChecked
                                className="size-4 cursor-pointer accent-ink"
                            />
                            {isAdmin ? "Remember me on this device" : "Remember me"}
                        </label>
                    )}

                    <input type="hidden" id="id-hidden-input" name="credentialId" value={auth?.selectedCredential} />

                    <Button
                        type="submit"
                        name="login"
                        id="kc-login"
                        disabled={isSubmitting || locked || !password || (!usernameHidden && !username.trim())}
                        // The design keeps the locked button black, not the grey disabled look
                        className={locked ? "disabled:bg-inverse!" : undefined}
                    >
                        {locked ? (
                            <span>
                                Locked · try again in <span className="tabular-nums">{formatSeconds(lockLeft)}</span>
                            </span>
                        ) : isSubmitting ? (
                            "Signing in…"
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </form>
            )}

            {/* Admin accounts are made by the team, so the admin page has no sign-up link */}
            {isAdmin ? null : locked && realm.resetPasswordAllowed ? (
                <FooterLink text="Forgot your password?" href={url.loginResetCredentialsUrl}>
                    Reset password
                </FooterLink>
            ) : (
                realm.registrationAllowed &&
                !registrationDisabled && (
                    <FooterLink text="Don’t have an account?" href={appSignUpUrl(kcContext.client) ?? url.registrationUrl}>
                        Create an account
                    </FooterLink>
                )
            )}
        </SplitLayout>
    );
}
