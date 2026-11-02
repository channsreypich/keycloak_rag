import { useEffect, useState } from "react";
import { CircleCheck, Info as InfoIcon } from "lucide-react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { ButtonLink } from "../components/button";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { StatusBox } from "../components/status-box";
import { SuccessToast } from "../components/success-toast";
import { GET_STARTED_PATH } from "../lib/constants";
import { appSignInUrl } from "../lib/kc-urls";
import { clearFlag, getFlag, PASSWORD_SENT } from "../lib/session-flags";

type Props = { kcContext: Extract<KcContext, { pageId: "info.ftl" }>; i18n: I18n };

/** Time to read the success message before going to sign in. */
const REDIRECT_DELAY_MS = 3000;

/** True for an untranslated key like "accountUpdatedTitle" (one word, with a capital or dot inside). */
function looksLikeMessageKey(text: string) {
    return !/\s/.test(text) && /[a-z][A-Z.-]/.test(text);
}

/** info.ftl: "Email Verified", or any other Keycloak info message. */
export default function Info(props: Props) {
    const { kcContext, i18n } = props;
    const { message, messageHeader, requiredActions, skipLink, pageRedirectUri, actionUri, client, auth } =
        kcContext;
    const { msgStr, advancedMsgStr } = i18n;

    // Where the main button goes: next Keycloak step, or back to the app
    const nextUrl = pageRedirectUri || actionUri || client.baseUrl;

    // Finished in a different browser from the one that started (for example
    // the Gmail app): Keycloak ends here, so we send the user to sign in.
    // After verifying email, sign in then opens Get Started.
    const isEmailVerified = message.summary === msgStr("emailVerifiedMessage");
    const isAccountUpdated = message.summary === msgStr("accountUpdatedMessage");
    const signInUrl = appSignInUrl(client, isEmailVerified ? GET_STARTED_PATH : undefined);
    const redirectUrl = (isEmailVerified || isAccountUpdated) && !actionUri ? pageRedirectUri || signInUrl : undefined;

    // True when this page follows the "Reset Password" form
    const [isPasswordReset] = useState(() => isAccountUpdated && getFlag(PASSWORD_SENT) === "1");

    useEffect(() => {
        clearFlag(PASSWORD_SENT);
        if (!redirectUrl) return;
        const timer = setTimeout(() => window.location.replace(redirectUrl), REDIRECT_DELAY_MS);
        return () => clearTimeout(timer);
    }, [redirectUrl]);

    if (isEmailVerified) {
        const email = auth?.attemptedUsername;
        return (
            <PageShell kcContext={kcContext} title="Email Verified">
                <AuthCard>
                    <PageHeader
                        icon={CircleCheck}
                        iconTone="success"
                        title="Email Verified"
                        subtitle={
                            redirectUrl
                                ? "Your email is confirmed. Let’s create your first chatbot."
                                : "Your email is confirmed. You can close this page now and sign in."
                        }
                    />
                    <div className="space-y-6">
                        {email && <StatusBox tone="success" label="Verified" value={email} />}
                        {actionUri ? (
                            <ButtonLink href={actionUri}>Continue</ButtonLink>
                        ) : (
                            redirectUrl && <ButtonLink href={redirectUrl}>Create your first chatbot</ButtonLink>
                        )}
                    </div>
                </AuthCard>
            </PageShell>
        );
    }

    if (isAccountUpdated) {
        const title = isPasswordReset ? "Password Updated" : "Account Updated";
        const doneText = isPasswordReset
            ? "Your password was reset and other sessions were signed out."
            : "Your account has been updated.";
        const nextText = redirectUrl ? "Redirecting to sign in…" : "You can close this page now and sign in.";
        return (
            <PageShell kcContext={kcContext} title={title}>
                {isPasswordReset && <SuccessToast title="Password updated">{`${doneText} ${nextText}`}</SuccessToast>}
                <AuthCard>
                    <PageHeader
                        icon={CircleCheck}
                        iconTone="success"
                        title={title}
                        subtitle={isPasswordReset ? "Sign in with your new password." : `${doneText} ${nextText}`}
                    />
                    {redirectUrl && <ButtonLink href={redirectUrl}>Back to sign in</ButtonLink>}
                </AuthCard>
            </PageShell>
        );
    }

    const actions = requiredActions?.map(action => advancedMsgStr(`requiredAction.${action}`)).join(", ");

    // Keycloak sends messageHeader as a message key or as finished text.
    // advancedMsgStr handles both. It returns the key itself when there is no
    // translation, and users should never see that.
    const header = messageHeader ? advancedMsgStr(messageHeader) : undefined;
    const title = header && !looksLikeMessageKey(header) ? header : actionUri ? "Confirm to Continue" : "Information";
    const showButton = !skipLink && !!nextUrl;

    return (
        <PageShell kcContext={kcContext} title={title}>
            <AuthCard>
                <PageHeader
                    icon={InfoIcon}
                    title={title}
                    subtitle={
                        <>
                            <span dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }} />
                            {actions && <span className="mt-2 block font-medium text-ink">{actions}</span>}
                        </>
                    }
                />
                {showButton ? (
                    <ButtonLink href={nextUrl}>{actionUri ? "Continue" : "Back to RAGStudio"}</ButtonLink>
                ) : (
                    <p className="text-center text-p3 text-ink-secondary">You can close this page now.</p>
                )}
            </AuthCard>
        </PageShell>
    );
}
