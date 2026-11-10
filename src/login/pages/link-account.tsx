import { useState, type FormEvent } from "react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { AuthCard } from "../components/auth-card";
import { Button, ButtonLink } from "../components/button";
import { LinkPreview } from "../components/link-preview";
import { PageHeader } from "../components/page-header";
import { PasswordField } from "../components/text-field";

type Props = {
    kcContext: Extract<KcContext, { pageId: "login.ftl" }>;
    i18n: I18n;
    provider: string;
};

/**
 * Keycloak's password step before linking a Google/GitHub account to an existing
 * account. Keycloak uses login.ftl for it.
 */
export function LinkAccount(props: Props) {
    const { kcContext, i18n, provider } = props;
    const { url, auth, realm, login, messagesPerField } = kcContext;
    const email = auth?.attemptedUsername ?? login.username;

    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>();

    const serverError = messagesPerField.existsError("username", "password")
        ? messagesPerField.getFirstError("username", "password")
        : undefined;
    const passwordError =
        error ?? (serverError === i18n.msgStr("invalidUserMessage") ? "Incorrect password. Please try again." : serverError);

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        if (!password) {
            event.preventDefault();
            setError("Please enter your password.");
            document.getElementById("password")?.focus();
            return;
        }
        setIsSubmitting(true);
    };

    return (
        <AuthCard>
            <PageHeader
                title="Link Account"
                subtitle={`An account with ${email ?? "this email"} already exists. Confirm your password to link ${provider} sign in.`}
            />
            <LinkPreview provider={provider} email={email} />
            <form id="kc-form-login" action={url.loginAction} method="post" noValidate onSubmit={onSubmit} className="space-y-4">
                <PasswordField
                    id="password"
                    name="password"
                    label="Password"
                    autoComplete="current-password"
                    autoFocus
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => {
                        setPassword(e.target.value);
                        setError(undefined);
                    }}
                    error={passwordError}
                    labelAside={
                        realm.resetPasswordAllowed && (
                            <a href={url.loginResetCredentialsUrl} className="text-p3 text-ink-secondary hover:text-ink hover:underline">
                                Forgot password?
                            </a>
                        )
                    }
                />
                <input type="hidden" name="username" value={email ?? ""} />
                <input type="hidden" id="id-hidden-input" name="credentialId" value={auth?.selectedCredential} />
                <Button type="submit" name="login" id="kc-login" disabled={isSubmitting}>
                    {isSubmitting ? "Linking…" : `Confirm & link ${provider}`}
                </Button>
                <ButtonLink href={url.loginRestartFlowUrl} variant="secondary">
                    Cancel
                </ButtonLink>
            </form>
            <p className="mt-6 text-p3 text-ink-secondary">
                You can connect or disconnect Google and GitHub anytime in Profile → Linked accounts
            </p>
        </AuthCard>
    );
}
