import { CircleCheck, Info as InfoIcon } from "lucide-react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { ButtonLink } from "../components/button";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { StatusBox } from "../components/status-box";

type Props = { kcContext: Extract<KcContext, { pageId: "info.ftl" }>; i18n: I18n };

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

    if (message.summary === msgStr("emailVerifiedMessage")) {
        const email = auth?.attemptedUsername;
        return (
            <PageShell kcContext={kcContext} title="Email Verified">
                <AuthCard>
                    <PageHeader
                        icon={CircleCheck}
                        iconTone="success"
                        title="Email Verified"
                        subtitle="Your email is confirmed. Let’s create your first chatbot."
                    />
                    <div className="space-y-6">
                        {email && <StatusBox tone="success" label="Verified" value={email} />}
                        {nextUrl && (
                            <ButtonLink href={nextUrl}>
                                {actionUri ? "Continue" : "Create your first chatbot"}
                            </ButtonLink>
                        )}
                    </div>
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
