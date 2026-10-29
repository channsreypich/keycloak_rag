import { Mail, Timer } from "lucide-react";
import { AuthCard } from "../components/auth-card";
import { ButtonLink } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { PageHeader } from "../components/page-header";
import { ResendCountdown } from "../components/resend-countdown";
import { StatusBox } from "../components/status-box";
import { RESET_LINK_MINUTES } from "../lib/constants";

/** Shown after "Send reset link" (Keycloak's "email sent" message). */
export function CheckEmail(props: { email?: string; signInUrl: string; forgotPasswordUrl: string }) {
    const { email, signInUrl, forgotPasswordUrl } = props;

    return (
        <AuthCard>
            <PageHeader
                icon={Mail}
                title="Check Your Email"
                subtitle={`If an account exists for ${email || "that email"}, we’ve sent a link to reset your password.`}
            />
            <div className="space-y-6">
                <StatusBox
                    tone="warning"
                    icon={Timer}
                    label="Link expires in"
                    value={`${RESET_LINK_MINUTES} minutes`}
                    aside={
                        <span className="rounded-pill border border-warning-line bg-card px-3 py-1 text-c2 text-warning-text">
                            Single-use
                        </span>
                    }
                />
                <ButtonLink href={signInUrl}>Back to sign in</ButtonLink>
            </div>
            <ResendCountdown href={forgotPasswordUrl} />
            <FooterLink text="Wrong email?" href={forgotPasswordUrl}>
                Try another address
            </FooterLink>
        </AuthCard>
    );
}
