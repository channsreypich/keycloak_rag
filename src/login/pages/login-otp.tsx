import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
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
import { focusFirstCodeBox, getCodeError } from "../lib/validation";

type Props = { kcContext: Extract<KcContext, { pageId: "login-otp.ftl" }>; i18n: I18n };

/**
 * login-otp.ftl: "Sign in with MFA" (enter the 6-digit code).
 * No Figma design yet; built in the same style as "Set Up Authenticator".
 */
export default function LoginOtp(props: Props) {
    const { kcContext } = props;
    const { url, otpLogin, messagesPerField, message } = kcContext;
    const credentials = otpLogin.userOtpCredentials;

    const selectedId = otpLogin.selectedCredentialId ?? credentials[0]?.id;
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Missing digits error, shown after the user presses "Verify"
    const [error, setError] = useState<string>();

    const codeError = error ?? (messagesPerField.existsError("totp") ? messagesPerField.get("totp") : undefined);

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const next = getCodeError(code, 6);
        if (next) {
            event.preventDefault();
            setError(next);
            focusFirstCodeBox("otp-label");
            return;
        }
        setIsSubmitting(true);
    };

    return (
        <PageShell kcContext={kcContext} title="Enter Verification Code">
            <AuthCard>
                <PageHeader
                    icon={ShieldCheck}
                    title="Enter Verification Code"
                    subtitle="Open your authenticator app and enter the 6-digit code for RAGStudio."
                />
                {!codeError && <FormMessage message={message} />}
                <form id="kc-otp-login-form" action={url.loginAction} method="post" noValidate onSubmit={onSubmit} className="space-y-6">
                    {/* No authenticator picker: the code is checked against the selected (or first) one */}
                    {selectedId && <input type="hidden" name="selectedCredentialId" value={selectedId} />}

                    <p id="otp-label" className="text-label uppercase text-ink">
                        Enter the 6-digit code
                    </p>
                    <OtpInput
                        name="otp"
                        labelId="otp-label"
                        error={!!codeError}
                        onChange={value => {
                            setCode(value);
                            setError(undefined);
                        }}
                    />
                    {codeError && (
                        <div className="flex justify-center">
                            <FieldError id="otp-error">{codeError}</FieldError>
                        </div>
                    )}

                    <Button type="submit" name="login" id="kc-login" disabled={isSubmitting}>
                        {isSubmitting ? "Verifying…" : "Verify"}
                    </Button>
                </form>
                <FooterLink text="Lost your authenticator?" href={SUPPORT_URL}>
                    Contact support
                </FooterLink>
                <FooterLink text="Not you?" href={url.loginRestartFlowUrl}>
                    Back to Sign in
                </FooterLink>
            </AuthCard>
        </PageShell>
    );
}
