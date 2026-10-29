import { TriangleAlert } from "lucide-react";
import { AuthCard } from "../components/auth-card";
import { ButtonLink } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { PageHeader } from "../components/page-header";
import { StatusBox } from "../components/status-box";
import { SUPPORT_URL } from "../lib/constants";

function formatDate(iso: string) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
        ? iso
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Shown instead of the Sign in form when Keycloak says the account is disabled. */
export function AccountSuspended(props: {
    signInUrl: string;
    email?: string;
    suspension?: { reason: string; suspendedAt: string };
}) {
    const { signInUrl, email, suspension } = props;

    return (
        <AuthCard>
            <PageHeader
                icon={TriangleAlert}
                iconTone="danger"
                title="Account Suspended"
                subtitle="An administrator suspended your account, so you can’t sign in right now. Your published chatbots are offline."
            />
            <div className="space-y-6">
                {suspension && (
                    <StatusBox
                        tone="danger"
                        label="Reason from admin"
                        value={suspension.reason}
                        aside={
                            <time dateTime={suspension.suspendedAt} className="text-p4 text-ink">
                                {formatDate(suspension.suspendedAt)}
                            </time>
                        }
                    />
                )}
                <ButtonLink href={signInUrl}>Back to sign in</ButtonLink>
            </div>
            <p className="mt-6 text-p3 text-ink-secondary">
                To appeal, reply to the suspension email we sent to {email || "your email address"}.
            </p>
            <FooterLink text="Questions?" href={SUPPORT_URL}>
                Contact support
            </FooterLink>
        </AuthCard>
    );
}
