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
                        subtitle="You’re signed in. Let’s create your first chatbot."
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

    return (
        <PageShell kcContext={kcContext} title={messageHeader || "Information"}>
            <AuthCard>
                <PageHeader
                    icon={InfoIcon}
                    title={messageHeader || "Information"}
                    subtitle={
                        <>
                            <span dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }} />
                            {actions && <span className="mt-2 block font-medium text-ink">{actions}</span>}
                        </>
                    }
                />
                {!skipLink && nextUrl && (
                    <ButtonLink href={nextUrl}>{actionUri ? "Continue" : "Back to RAGStudio"}</ButtonLink>
                )}
            </AuthCard>
        </PageShell>
    );
}
