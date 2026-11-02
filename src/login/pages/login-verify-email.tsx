import { useEffect, useState } from "react";
import { Mail, RefreshCw, SquarePen } from "lucide-react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { ButtonLink } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { FormMessage } from "../components/form-message";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { ResendCountdown } from "../components/resend-countdown";
import { StatusBox } from "../components/status-box";
import { getFlag, SIGNED_UP } from "../lib/session-flags";

type Props = { kcContext: Extract<KcContext, { pageId: "login-verify-email.ftl" }>; i18n: I18n };

// Keycloak shows this same page again after "Resend", without saying so.
// We remember the click for one page load to show "New Link Sent".
const RESENT_KEY = "ragstudio:verify-email-resent";

function markResent() {
    try {
        sessionStorage.setItem(RESENT_KEY, "1");
    } catch {
        // Storage blocked: the page just shows the normal title
    }
}

function wasResent() {
    try {
        return sessionStorage.getItem(RESENT_KEY) === "1";
    } catch {
        return false;
    }
}

/** "15 minutes", "1 hour", "24 hours". */
function formatLifespan(minutes: number) {
    const [value, unit] = minutes % 60 === 0 ? [minutes / 60, "hour"] : [minutes, "minute"];
    return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

/**
 * login-verify-email.ftl: "Verify Email" after sign up, "Verify Your Email First"
 * after signing in, or "New Link Sent" right after a resend.
 */
export default function LoginVerifyEmail(props: Props) {
    const { kcContext } = props;
    const { url, user, message } = kcContext;

    const [resent] = useState(wasResent);
    useEffect(() => {
        // Only for this page load; a refresh shows the normal page
        try {
            sessionStorage.removeItem(RESENT_KEY);
        } catch {
            // ignore
        }
    }, []);

    // Keycloak sends the default "You need to verify your email…" text as a
    // warning. The page already says that, so only show other messages.
    const extraMessage = message?.type === "warning" ? undefined : message;

    // No note from the sign-up form: the user came here by signing in
    const [fromSignIn] = useState(() => getFlag(SIGNED_UP) !== "1");

    if (fromSignIn && !resent) {
        const minutes = (kcContext.realm as { verifyEmailActionTokenLifespanMinutes?: number }).verifyEmailActionTokenLifespanMinutes;
        return (
            <PageShell kcContext={kcContext} title="Verify Your Email First">
                <AuthCard>
                    <PageHeader
                        icon={Mail}
                        iconTone="inverse"
                        title="Verify Your Email First"
                        subtitle="This account hasn’t been verified yet, so you can’t sign in. Open the link we sent, or get a new one."
                    />
                    <FormMessage message={extraMessage} />
                    <div className="space-y-4">
                        {user?.email && (
                            <StatusBox
                                label="Unverified email"
                                value={user.email}
                                aside={
                                    <a
                                        href={url.loginRestartFlowUrl}
                                        className="flex items-center gap-2 text-p4 text-ink hover:underline"
                                    >
                                        <SquarePen aria-hidden className="size-4" />
                                        Change email
                                    </a>
                                }
                            />
                        )}
                        <ButtonLink href={url.loginAction} onClick={markResent}>
                            Resend verification email
                        </ButtonLink>
                        <ButtonLink href={url.loginRestartFlowUrl} variant="secondary">
                            Back to sign in
                        </ButtonLink>
                    </div>
                    {minutes && (
                        <p className="mt-6 text-p3 text-ink-secondary">
                            Verification links expire after {formatLifespan(minutes)}.
                        </p>
                    )}
                    <FooterLink text="Wrong account?" href={url.loginRestartFlowUrl}>
                        Use a different email
                    </FooterLink>
                </AuthCard>
            </PageShell>
        );
    }

    return (
        <PageShell kcContext={kcContext} title={resent ? "New Link Sent" : "Verify Email"}>
            <AuthCard>
                {resent ? (
                    <PageHeader
                        title="New Link Sent"
                        subtitle="We sent a fresh verification link to your inbox."
                    />
                ) : (
                    <PageHeader
                        icon={Mail}
                        title="Verify Email"
                        subtitle="We sent a verification link to your email. Click it to activate your RAGStudio account."
                    />
                )}
                <FormMessage message={extraMessage} />
                <div className="space-y-6">
                    {user?.email && (
                        <StatusBox
                            label="Sent to"
                            value={user.email}
                            aside={
                                // TODO(backend): Keycloak cannot change the email on this
                                // page. This restarts sign in so the user can register again.
                                <a
                                    href={url.loginRestartFlowUrl}
                                    className="flex items-center gap-2 text-p4 text-ink hover:underline"
                                >
                                    <SquarePen aria-hidden className="size-4" />
                                    Change email
                                </a>
                            }
                        />
                    )}
                    {/* Opening loginAction again makes Keycloak send a new email */}
                    <ButtonLink href={url.loginAction} onClick={markResent}>
                        <RefreshCw aria-hidden className="size-5" />
                        Resend verification email
                    </ButtonLink>
                </div>
                <ResendCountdown href={url.loginAction} onResend={markResent} />
                <FooterLink text="Already verified?" href={url.loginRestartFlowUrl}>
                    Sign in
                </FooterLink>
            </AuthCard>
        </PageShell>
    );
}
