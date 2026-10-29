import { useState, type FormEvent, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { Button } from "../components/button";
import { FieldError } from "../components/text-field";
import { FormMessage } from "../components/form-message";
import { OtpInput } from "../components/otp-input";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { Callout } from "../components/status-box";
import { AUTHENTICATOR_APPS } from "../lib/constants";
import { focusFirstCodeBox, getCodeError } from "../lib/validation";

type Props = { kcContext: Extract<KcContext, { pageId: "login-config-totp.ftl" }>; i18n: I18n };

function Step(props: { n: number; children: ReactNode }) {
    return (
        <li className="flex gap-3 text-p4 text-ink">
            <span aria-hidden className="pt-0.5 text-c2 text-ink-muted">
                {props.n}
            </span>
            <span>{props.children}</span>
        </li>
    );
}

/** login-config-totp.ftl: "Set Up Authenticator" (first MFA setup). */
export default function LoginConfigTotp(props: Props) {
    const { kcContext } = props;
    const { url, totp, mode, messagesPerField, message } = kcContext;

    const [copied, setCopied] = useState(false);
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const digits = totp.policy.digits;
    // Missing digits error, shown after the user presses "Verify"
    const [error, setError] = useState<string>();

    const codeError = error ?? (messagesPerField.existsError("totp", "userLabel") ? messagesPerField.getFirstError("totp", "userLabel") : undefined);

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const next = getCodeError(code, digits);
        if (next) {
            event.preventDefault();
            setError(next);
            focusFirstCodeBox("totp-label");
            return;
        }
        setIsSubmitting(true);
    };

    // "Authenticator app", or "Authenticator app 2", 3, ... if that name is taken
    const usedNames = new Set(totp.otpCredentials.map(c => c.userLabel));
    let deviceName = "Authenticator app";
    for (let n = 2; usedNames.has(deviceName); n++) deviceName = `Authenticator app ${n}`;

    const copyKey = async () => {
        try {
            await navigator.clipboard.writeText(totp.totpSecretEncoded.replace(/\s/g, ""));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard blocked: the key is still visible to copy by hand
        }
    };

    return (
        <PageShell kcContext={kcContext} title="Set Up Authenticator">
            <AuthCard>
                <PageHeader title="Set Up Authenticator" subtitle="Admin accounts must use an authenticator app (TOTP). This takes about a minute." />
                <div className="space-y-6">
                    {!codeError && message?.type !== "warning" && <FormMessage message={message} />}

                    <Callout title="Multi-Factor Authentication is required for Admins">
                        You can’t access the Admin console until setup is complete.
                    </Callout>

                    <div className="flex flex-col items-center gap-5 rounded-input border border-line bg-subtle p-4 text-left sm:flex-row sm:p-5">
                        <img
                            src={`data:image/png;base64,${totp.totpSecretQrCode}`}
                            alt="QR code for your authenticator app"
                            draggable={false}
                            className="size-36 shrink-0 rounded-small border border-line bg-card p-2 sm:size-32"
                        />
                        <ol className="w-full min-w-0 space-y-3">
                            <Step n={1}>Scan the QR code with {AUTHENTICATOR_APPS}.</Step>
                            <Step n={2}>Or enter this key manually:</Step>
                            <li className="flex items-center justify-between gap-2 rounded-small border border-line bg-card py-1.5 pr-1.5 pl-3">
                                <code
                                    id="kc-totp-secret-key"
                                    className="min-w-0 font-mono text-c2 font-medium tracking-wide wrap-break-word text-ink"
                                >
                                    {totp.totpSecretEncoded}
                                </code>
                                <button
                                    type="button"
                                    onClick={copyKey}
                                    className="flex shrink-0 items-center gap-1.5 rounded-tag px-2.5 py-1.5 text-c2 text-ink-secondary hover:bg-subtle hover:text-ink"
                                >
                                    {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
                                    <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
                                </button>
                            </li>
                        </ol>
                    </div>

                    <form id="kc-totp-settings-form" action={url.loginAction} method="post" noValidate onSubmit={onSubmit} className="space-y-6">
                        <p id="totp-label" className="text-label uppercase text-ink">
                            <span className="mr-2">3</span>Enter the {digits}-digit code
                        </p>
                        <OtpInput
                            name="totp"
                            labelId="totp-label"
                            length={digits}
                            error={!!codeError}
                            onChange={value => {
                                setCode(value);
                                setError(undefined);
                            }}
                        />
                        {codeError && (
                            <div className="flex justify-center">
                                <FieldError id="totp-error">{codeError}</FieldError>
                            </div>
                        )}
                        <input type="hidden" id="totpSecret" name="totpSecret" value={totp.totpSecret} />
                        {/* Keycloak requires a device name once the user has an authenticator; we pick one */}
                        <input type="hidden" id="userLabel" name="userLabel" value={deviceName} />
                        {mode && <input type="hidden" id="mode" name="mode" value={mode} />}

                        <Button type="submit" id="saveTOTPBtn" disabled={isSubmitting}>
                            {isSubmitting ? "Verifying…" : "Verify"}
                        </Button>
                    </form>
                </div>
            </AuthCard>
        </PageShell>
    );
}
