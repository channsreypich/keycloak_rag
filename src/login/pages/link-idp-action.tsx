import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { Button } from "../components/button";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";

type Props = { kcContext: Extract<KcContext, { pageId: "link-idp-action.ftl" }>; i18n: I18n };

/**
 * link-idp-action.ftl: "Connect" on the app's Linked accounts page
 * (kc_action=idp_link:<alias>). Continue opens Google/GitHub sign-in, then
 * Keycloak links it and goes back to the app. Cancel goes back without it.
 */
export default function LinkIdpAction(props: Props) {
    const { kcContext } = props;
    const { url, idpDisplayName } = kcContext;

    return (
        <PageShell kcContext={kcContext} title={`Connect ${idpDisplayName}`}>
            <AuthCard>
                <PageHeader
                    title={`Connect ${idpDisplayName}`}
                    subtitle={`Sign in with ${idpDisplayName} to link it to your RAGStudio account. Then you can use it to sign in.`}
                />
                <form action={url.loginAction} method="post" className="space-y-4">
                    {/* Keycloak reads which button was pressed from its name */}
                    <Button type="submit" name="continue" id="kc-continue">
                        Continue with {idpDisplayName}
                    </Button>
                    <Button type="submit" name="cancel-aia" id="kc-cancel" variant="secondary">
                        Cancel
                    </Button>
                </form>
            </AuthCard>
        </PageShell>
    );
}
