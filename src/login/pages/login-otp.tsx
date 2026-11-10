import { useState, type FormEvent } from "react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { Button } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { FormMessage } from "../components/form-message";
import { OtpInput } from "../components/otp-input";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { FieldError } from "../components/text-field";
import { SUPPORT_URL } from "../lib/constants";
import { CODE_SENT, setFlag, takeFlag } from "../lib/session-flags";
import { focusFirstCodeBox, getCodeError } from "../lib/validation";

type Props = { kcContext: Extract<KcContext, { pageId: "login-otp.ftl" }>; i18n: I18n };

/**
 * login-otp.ftl: "Enter Verification Code" (the 6-digit code from the authenticator app).
 */
export default function LoginOtp(props: Props) {
    const { kcContext } = props;
    const { url, otpLogin, messagesPerField, message } = kcContext;
    const credentials = otpLogin.userOtpCredentials;

    const selectedId = otpLogin.selectedCredentialId ?? credentials[0]?.id;
    // Keycloak reloads the page after a wrong code, so keep the code it refused in the boxes
    const [sentCode] = useState(() => {
        const sent = takeFlag(CODE_SENT);
        return messagesPerField.existsError("totp") ? (sent ?? "") : "";
    });
    const [code, setCode] = useState(sentCode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Missing digits error, shown after the user presses "Verify"
    const [error, setError] = useState<string>();

    const codeError =
        error ??
        (messagesPerField.existsError("totp") ? "That code didn’t work. Codes refresh every 30 seconds — enter the newest one." : undefined);
    const email = kcContext.auth?.attemptedUsername;

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const next = getCodeError(code, 6);
        if (next) {
            event.preventDefault();
            setError(next);
            focusFirstCodeBox("otp-label");
            return;
        }
        setFlag(CODE_SENT, code);
        setIsSubmitting(true);
    };

    return (
        <PageShell kcContext={kcContext} title="Enter Verification Code">
            <AuthCard>
                <PageHeader
                    title="Enter Verification Code"
                    subtitle={`Enter the 6-digit code from your authenticator app${email ? ` for ${email}` : ""}.`}
                />
                {!codeError && <FormMessage message={message} />}
                <form id="kc-otp-login-form" action={url.loginAction} method="post" noValidate onSubmit={onSubmit} className="space-y-6">
                    {/* No authenticator picker: the code is checked against the selected (or first) one */}
                    {selectedId && <input type="hidden" name="selectedCredentialId" value={selectedId} />}

                    <p id="otp-label" className="sr-only">
                        Enter the 6-digit code
                    </p>
                    <OtpInput
                        name="otp"
                        labelId="otp-label"
                        initialCode={sentCode}
                        error={!!codeError}
                        onChange={value => {
                            setCode(value);
                            setError(undefined);
                        }}
                    />
                    {codeError ? (
                        <div className="flex justify-center">
                            <FieldError id="otp-error">{codeError}</FieldError>
                        </div>
                    ) : (
                        <p className="text-left text-p4 text-ink-secondary">Code refreshes every 30 seconds</p>
                    )}

                    <Button type="submit" name="login" id="kc-login" disabled={isSubmitting}>
                        {isSubmitting ? "Verifying…" : "Verify"}
                    </Button>
                </form>
                <FooterLink text="Lost your device?" href={SUPPORT_URL}>
                    Contact your administrator
                </FooterLink>
            </AuthCard>
        </PageShell>
    );
}
