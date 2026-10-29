import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { Button } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { FormMessage } from "../components/form-message";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { TextField } from "../components/text-field";
import { loginActionUrl } from "../lib/kc-urls";
import { getEmailError } from "../lib/validation";
import { ResetLinkExpired } from "./link-expired";

type Props = { kcContext: Extract<KcContext, { pageId: "login-reset-password.ftl" }>; i18n: I18n };

/** login-reset-password.ftl: "Forgot Password" (enter your email). */
export default function LoginResetPassword(props: Props) {
    const { kcContext, i18n } = props;
    const { url, auth, messagesPerField, message } = kcContext;
    const { msgStr } = i18n;

    const [email, setEmail] = useState(auth.attemptedUsername ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Empty or badly typed email error, shown after the user presses "Send reset link"
    const [error, setError] = useState<string>();

    // An expired reset link can also bring the user back to this page
    const isExpired =
        message?.type === "error" && [msgStr("expiredActionMessage"), msgStr("expiredActionTokenSessionExistsMessage")].includes(message.summary);

    if (isExpired) {
        return (
            <PageShell kcContext={kcContext} title="Link Expired">
                <ResetLinkExpired forgotPasswordUrl={url.loginResetCredentialsUrl} signInUrl={url.loginRestartFlowUrl} />
            </PageShell>
        );
    }

    // Keycloak calls this field "username"; people know it as their email
    const serverError = messagesPerField.existsError("username") ? "Please enter your email." : undefined;
    const emailError = error ?? serverError;

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const next = getEmailError(email);
        if (next) {
            event.preventDefault();
            setError(next);
            document.getElementById("username")?.focus();
            return;
        }
        setIsSubmitting(true);
    };

    return (
        <PageShell kcContext={kcContext} title="Forgot Password">
            <AuthCard>
                <PageHeader
                    icon={KeyRound}
                    title="Forgot Password"
                    subtitle="Enter the email you use for RAGStudio and we’ll send you a link to reset it."
                />
                {!emailError && <FormMessage message={message} />}
                <form id="kc-reset-password-form" action={url.loginAction} method="post" noValidate onSubmit={onSubmit} className="space-y-6">
                    <TextField
                        id="username"
                        name="username"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => {
                            setEmail(e.target.value);
                            setError(undefined);
                        }}
                        error={emailError}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Sending…" : "Send reset link"}
                    </Button>
                </form>
                <FooterLink text="Don’t have an account?" href={loginActionUrl(url.loginUrl, "registration")}>
                    Sign up
                </FooterLink>
            </AuthCard>
        </PageShell>
    );
}
