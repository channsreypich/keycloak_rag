import { CircleAlert } from "lucide-react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { ButtonLink } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { getActionTokenType, loginActionUrl } from "../lib/kc-urls";
import { ResetLinkExpired, VerifyLinkExpired } from "./link-expired";
import { NoAccountFound, providerDisplayName } from "./no-account-found";

type Props = { kcContext: Extract<KcContext, { pageId: "error.ftl" }>; i18n: I18n };

/** error.ftl: expired email links, "No Account Found" (Google/GitHub), or any other Keycloak error. */
export default function ErrorPage(props: Props) {
    const { kcContext, i18n } = props;
    const { url, message, client, auth } = kcContext;
    const { msgStr } = i18n;

    const expiredMessages = [
        msgStr("expiredActionMessage"),
        msgStr("expiredActionTokenNoSessionMessage"),
        msgStr("expiredActionTokenSessionExistsMessage")
    ];

    // "User {0} authenticated with identity provider {1} does not exist."
    // Fill the template with markers, then turn it into a pattern that
    // captures the email and the provider alias.
    const noAccountTemplate = msgStr("federatedIdentityUnavailableMessage", "\u0000EMAIL\u0000", "\u0000IDP\u0000");
    const noAccountPattern = new RegExp(
        "^" +
            noAccountTemplate
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                .replace("\u0000EMAIL\u0000", "(.+?)")
                .replace("\u0000IDP\u0000", "(.+?)") +
            "$"
    );
    const noAccount = message.summary.match(noAccountPattern);

    if (noAccount) {
        return (
            <PageShell kcContext={kcContext} title="No Account Found">
                <NoAccountFound
                    provider={providerDisplayName(noAccount[2])}
                    email={noAccount[1].includes("@") ? noAccount[1] : auth?.attemptedUsername}
                    signUpUrl={loginActionUrl(url.loginUrl, "registration")}
                    signInUrl={url.loginUrl}
                />
            </PageShell>
        );
    }

    if (expiredMessages.includes(message.summary)) {
        const isReset = getActionTokenType() === "reset-credentials";
        return (
            <PageShell kcContext={kcContext} title="Link Expired">
                {isReset ? (
                    <ResetLinkExpired
                        forgotPasswordUrl={loginActionUrl(url.loginUrl, "reset-credentials")}
                        signInUrl={url.loginUrl}
                    />
                ) : (
                    <VerifyLinkExpired email={auth?.attemptedUsername} signInUrl={url.loginUrl} />
                )}
            </PageShell>
        );
    }

    return (
        <PageShell kcContext={kcContext} title="Something Went Wrong">
            <AuthCard>
                <PageHeader
                    icon={CircleAlert}
                    iconTone="danger"
                    title="Something Went Wrong"
                    subtitle={<span dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }} />}
                />
                <ButtonLink href={client?.baseUrl || url.loginUrl}>
                    {client?.baseUrl ? "Back to RAGStudio" : "Back to sign in"}
                </ButtonLink>
                {client?.baseUrl && (
                    <FooterLink text="Want to try again?" href={url.loginUrl}>
                        Sign in
                    </FooterLink>
                )}
            </AuthCard>
        </PageShell>
    );
}
