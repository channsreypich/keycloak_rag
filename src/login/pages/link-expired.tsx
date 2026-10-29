import { useState } from "react";
import { AuthCard } from "../components/auth-card";
import { ButtonLink } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { PageHeader } from "../components/page-header";
import { TextField } from "../components/text-field";
import { RESET_LINK_MINUTES } from "../lib/constants";

/** Expired email verification link. */
export function VerifyLinkExpired(props: { email?: string; signInUrl: string }) {
    const { signInUrl } = props;
    const [email, setEmail] = useState(props.email ?? "");

    return (
        <AuthCard>
            <PageHeader
                title="Link Expired"
                subtitle="For your security, verification links expire after a short time. Request a new one below."
            />
            <div className="space-y-6">
                <TextField
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    error="Your verification link has expired or was already used."
                />
                {/*
                  TODO(backend): Keycloak has no "resend by email" endpoint.
                  For now this goes to Sign in: after signing in, Keycloak
                  sends a new verification email by itself.
                */}
                <ButtonLink href={signInUrl}>Resend link</ButtonLink>
            </div>
            <FooterLink text="Wrong account?" href={signInUrl}>
                Back to Sign in
            </FooterLink>
        </AuthCard>
    );
}

/** Expired or already used password reset link. */
export function ResetLinkExpired(props: { forgotPasswordUrl: string; signInUrl: string }) {
    return (
        <AuthCard>
            <PageHeader
                title="Link Expired"
                subtitle={`This reset link has expired or was already used. Reset links are valid for ${RESET_LINK_MINUTES} minutes and can only be used once.`}
            />
            <ButtonLink href={props.forgotPasswordUrl}>Request new reset link</ButtonLink>
            <FooterLink text="Remembered it?" href={props.signInUrl}>
                Back to Sign in
            </FooterLink>
        </AuthCard>
    );
}
