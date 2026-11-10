import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { Button } from "../components/button";
import { LinkPreview } from "../components/link-preview";
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
        <PageShell kcContext={kcContext} title={`Link ${idpDisplayName}`}>
            <AuthCard>
                <PageHeader
                    title={`Link ${idpDisplayName}`}
                    subtitle={`Do you want to link your RAGStudio account with ${idpDisplayName}? After that you can sign in with ${idpDisplayName}.`}
                />
                <LinkPreview provider={idpDisplayName} />
                <form action={url.loginAction} method="post" className="space-y-4">
                    {/* Keycloak reads which button was pressed from its name */}
                    <Button type="submit" name="continue" id="kc-continue">
                        Continue with {idpDisplayName}
                    </Button>
                    <Button type="submit" name="cancel-aia" id="kc-cancel" variant="secondary">
                        Cancel
                    </Button>
                </form>
                <p className="mt-6 text-center text-p3 text-ink-secondary">
                    You can connect or disconnect Google and GitHub anytime in Profile → Linked accounts
                </p>
            </AuthCard>
        </PageShell>
    );
}
