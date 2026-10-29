import { AuthCard } from "../components/auth-card";
import { ButtonLink } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { PageHeader } from "../components/page-header";
import { StatusBox } from "../components/status-box";

const PROVIDER_NAMES: Record<string, string> = { google: "Google", github: "GitHub" };

export function providerDisplayName(alias: string) {
    return PROVIDER_NAMES[alias.toLowerCase()] ?? alias.charAt(0).toUpperCase() + alias.slice(1);
}

/**
 * Signing in with Google/GitHub when no RAGStudio account uses that email.
 * Keycloak only shows this (instead of creating the account) when the realm's
 * "first broker login" flow is set to not create new users.
 */
export function NoAccountFound(props: {
    provider: string;
    email?: string;
    signUpUrl: string;
    signInUrl: string;
}) {
    const { provider, email, signUpUrl, signInUrl } = props;

    return (
        <AuthCard>
            <PageHeader
                align="left"
                title="No Account Found"
                subtitle={`There’s no RAGStudio account for this ${provider} account yet. Please sign up first.`}
            />
            <div className="space-y-4">
                {email && <StatusBox tone="danger" label={`${provider} account`} value={email} />}
                <ButtonLink href={signUpUrl}>Sign up</ButtonLink>
                <ButtonLink href={signInUrl} variant="secondary">
                    Back to sign in
                </ButtonLink>
            </div>
            {/* Back on Sign in the user can pick the provider again and choose another account */}
            <FooterLink text="Wrong account?" href={signInUrl}>
                Use a different {provider} account
            </FooterLink>
        </AuthCard>
    );
}
