import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { Button, ButtonLink } from "../components/button";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { providerDisplayName } from "./no-account-found";

type Props = { kcContext: Extract<KcContext, { pageId: "login-idp-link-confirm.ftl" }>; i18n: I18n };

/**
 * login-idp-link-confirm.ftl: Keycloak's first step when a Google/GitHub email
 * already has an account. The next step asks for the password ("Link Account").
 */
export default function LoginIdpLinkConfirm(props: Props) {
    const { kcContext } = props;
    const { url, idpAlias } = kcContext;
    const provider = providerDisplayName(idpAlias);

    return (
        <PageShell kcContext={kcContext} title="Link Account">
            <AuthCard>
                <PageHeader
                    title="Link Account"
                    subtitle={`An account with this email already exists. Continue to link ${provider} sign in.`}
                />
                <form id="kc-register-form" action={url.loginAction} method="post" className="space-y-4">
                    <Button type="submit" name="submitAction" id="linkAccount" value="linkAccount">
                        Continue
                    </Button>
                    <ButtonLink href={url.loginRestartFlowUrl} variant="secondary">
                        Cancel
                    </ButtonLink>
                </form>
            </AuthCard>
        </PageShell>
    );
}
