import { Clock } from "lucide-react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { ButtonLink } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";

type Props = { kcContext: Extract<KcContext, { pageId: "login-page-expired.ftl" }>; i18n: I18n };

/** login-page-expired.ftl: the sign in page was open too long. */
export default function LoginPageExpired(props: Props) {
    const { kcContext } = props;
    const { url } = kcContext;

    return (
        <PageShell kcContext={kcContext} title="Page Expired">
            <AuthCard>
                <PageHeader
                    icon={Clock}
                    title="Page Expired"
                    subtitle="This page was open for too long. Start again to continue signing in."
                />
                <ButtonLink id="loginRestartLink" href={url.loginRestartFlowUrl}>
                    Start again
                </ButtonLink>
                <FooterLink text="Already signed in?" href={url.loginAction}>
                    Continue
                </FooterLink>
            </AuthCard>
        </PageShell>
    );
}
