import { useMemo, useState, type FormEvent } from "react";
import { CircleCheck } from "lucide-react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { Button } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { FormMessage } from "../components/form-message";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { PasswordStrength } from "../components/password-strength";
import { Callout } from "../components/status-box";
import { PasswordField } from "../components/text-field";
import { getPasswordChecks, getPasswordStrength } from "../lib/password-rules";

type Props = { kcContext: Extract<KcContext, { pageId: "login-update-password.ftl" }>; i18n: I18n };

/** login-update-password.ftl: "Reset Password" (choose a new password). */
export default function LoginUpdatePassword(props: Props) {
    const { kcContext } = props;
    const { url, auth, messagesPerField, message } = kcContext;
    const email = auth?.attemptedUsername;

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const checks = useMemo(
        () => getPasswordChecks({ password, email, withCommonCheck: false }),
        [password, email]
    );
    const strength = getPasswordStrength(password, checks);

    const serverError = (field: string) =>
        messagesPerField.existsError(field) ? messagesPerField.get(field) : undefined;
    const matches = confirm.length > 0 && confirm === password;
    const mismatch = confirm.length > 0 && confirm !== password ? "Passwords don’t match." : undefined;
    const hasFieldErrors = messagesPerField.existsError("password", "password-confirm");

    // Empty-field errors, shown after the user presses "Reset password"
    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const next = {
            password: !password
                ? "Please enter a new password."
                : checks.some(check => !check.ok)
                  ? "Your password doesn’t meet the requirements above."
                  : strength < 2
                    ? "This password is too weak. Make it longer, or mix in capitals, numbers or symbols."
                    : undefined,
            confirm: !confirm ? "Please confirm your password." : mismatch
        };
        if (next.password || next.confirm) {
            event.preventDefault();
            setErrors(next);
            document.getElementById(next.password ? "password-new" : "password-confirm")?.focus();
            return;
        }
        setIsSubmitting(true);
    };

    return (
        <PageShell kcContext={kcContext} title="Reset Password">
            <AuthCard>
                <PageHeader
                    title="Reset Password"
                    subtitle={`Choose a strong password you haven’t used before for ${email || "your account"}.`}
                />
                {!hasFieldErrors && message?.type !== "warning" && <FormMessage message={message} />}
                <form
                    id="kc-passwd-update-form"
                    action={url.loginAction}
                    method="post"
                    noValidate
                    onSubmit={onSubmit}
                    className="space-y-4 tall:space-y-6"
                >
                    <PasswordField
                        id="password-new"
                        name="password-new"
                        label="Password"
                        autoComplete="new-password"
                        autoFocus
                        required
                        placeholder="Create a password"
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value);
                            setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        error={errors.password ?? serverError("password")}
                        below={password.length > 0 && <PasswordStrength strength={strength} checks={checks} />}
                    />
                    <PasswordField
                        id="password-confirm"
                        name="password-confirm"
                        label="Confirm password"
                        autoComplete="new-password"
                        required
                        placeholder="Repeat your password"
                        value={confirm}
                        onChange={e => {
                            setConfirm(e.target.value);
                            setErrors(prev => ({ ...prev, confirm: undefined }));
                        }}
                        error={errors.confirm ?? serverError("password-confirm") ?? mismatch}
                        below={
                            matches && (
                                <p aria-live="polite" className="mt-2 flex items-center gap-2 text-p4 text-success-text">
                                    <CircleCheck aria-hidden className="size-4" />
                                    Passwords match
                                </p>
                            )
                        }
                    />

                    <Callout title="You’ll be logged out everywhere else">
                        After resetting, all other active sessions on other devices will be logged out.
                    </Callout>
                    <input type="hidden" name="logout-sessions" value="on" />

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving…" : "Reset password"}
                    </Button>
                </form>
                <FooterLink text="Changed your mind?" href={url.loginRestartFlowUrl}>
                    Back to Sign in
                </FooterLink>
            </AuthCard>
        </PageShell>
    );
}
