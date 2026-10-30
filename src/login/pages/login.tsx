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
import { ADMIN_CLIENT_ID, LOCKOUT_SECONDS } from "../lib/constants";
import { formatSeconds, useCountdown } from "../lib/countdown";
import { getEmailError } from "../lib/validation";
import { AccountPendingDeletion } from "./account-pending-deletion";
import { AccountSuspended } from "./account-suspended";
import { CheckEmail } from "./check-email";

type Props = { kcContext: Extract<KcContext, { pageId: "login.ftl" }>; i18n: I18n };

/**
 * login.ftl. Keycloak also uses this page for two other screens:
 * - account disabled  → "Account Suspended"
 * - reset email sent  → "Check Your Email"
 * And, when the backend sends `pendingDeletion`, "Account Pending Deletion".
 */
export default function Login(props: Props) {
    const { kcContext, i18n } = props;
    const { url, message, login, auth } = kcContext;
    const { msgStr } = i18n;

    const email = login.username || auth?.attemptedUsername;

    if (kcContext.pendingDeletion) {
        return (
            <PageShell kcContext={kcContext} title="Account Pending Deletion">
                <AccountPendingDeletion signOutUrl={url.loginRestartFlowUrl} pendingDeletion={kcContext.pendingDeletion} />
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

    const [username, setUsername] = useState(login.username ?? "");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Empty or badly typed field errors, shown after the user presses "Sign in"
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

    // Too many failed attempts: Keycloak's "temporarily disabled" message, or
    // the lock time sent by the backend (see `bruteForce` in KcContext.ts)
    const isLocked = message?.summary === i18n.msgStr("accountTemporarilyDisabledMessage") || (bruteForce?.lockedForSeconds ?? 0) > 0;
    const lockLeft = useCountdown(isLocked ? bruteForce?.lockedForSeconds ?? LOCKOUT_SECONDS : 0);
    const locked = lockLeft > 0;

    const attemptsLeft = bruteForce?.attemptsLeft;
    const keycloakCredentialsError = messagesPerField.existsError("username", "password")
        ? messagesPerField.getFirstError("username", "password")
        : undefined;
    // People sign in with their email, so say "email" instead of Keycloak's "username"
    const serverCredentialsError =
        keycloakCredentialsError === i18n.msgStr("invalidUserMessage") ? "Invalid email or password." : keycloakCredentialsError;
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
        setIsSubmitting(true);
    };

    return (
        <SplitLayout panelSide="right">
            <PageHeader
                align="left"
                eyebrow={isAdmin ? "Admin console" : undefined}
                title={isAdmin ? "Admin sign-in" : "Sign In"}
                subtitle="Welcome back. Sign in to manage your chatbots and knowledge bases."
            />

            {!isAdmin && <SocialButtons providers={social?.providers} dividerText="or sign in with email" />}

            {/* The field error below already explains bad credentials and locks */}
            {!credentialsError && <FormMessage message={message} />}

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
                            autoFocus
                            placeholder={isAdmin ? "you@company.com" : "Enter your email"}
                            plainLabel={isAdmin}
                            value={username}
                            onChange={e => {
                                setUsername(e.target.value);
                                setErrors(prev => ({ ...prev, username: undefined }));
                            }}
                            error={errors.username}
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

                    {realm.rememberMe && !usernameHidden && !(isAdmin && locked) && (
                        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-p3 text-ink-body">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                name="rememberMe"
                                defaultChecked={!!login.rememberMe}
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
                        disabled={isSubmitting || locked}
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
            {isAdmin ? null : isLocked && realm.resetPasswordAllowed ? (
                <FooterLink text="Forgot your password?" href={url.loginResetCredentialsUrl}>
                    Reset password
                </FooterLink>
            ) : (
                realm.registrationAllowed &&
                !registrationDisabled && (
                    <FooterLink text="Don’t have an account?" href={url.registrationUrl}>
                        Create an account
                    </FooterLink>
                )
            )}
        </SplitLayout>
    );
}
