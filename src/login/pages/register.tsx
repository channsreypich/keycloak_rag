import { useMemo, useState, type FormEvent } from "react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { FormMessage } from "../components/form-message";
import { PageHeader } from "../components/page-header";
import { PageShell } from "../components/page-shell";
import { PasswordStrength } from "../components/password-strength";
import { SocialButtons } from "../components/social-buttons";
import { SplitLayout } from "../components/split-layout";
import { FieldError, PasswordField, TextField } from "../components/text-field";
import { cn } from "../lib/cn";
import { getPasswordChecks, getPasswordStrength } from "../lib/password-rules";
import { getEmailError, getFullNameError } from "../lib/validation";

type Props = { kcContext: Extract<KcContext, { pageId: "register.ftl" }>; i18n: I18n };

/** Form fields in screen order, with the id of the input to focus when invalid. */
const FIELDS = ["fullName", "email", "password", "confirm", "terms"] as const;
type Field = (typeof FIELDS)[number];
const FIELD_IDS: Record<Field, string> = {
    fullName: "fullName",
    email: "email",
    password: "password",
    confirm: "password-confirm",
    terms: "termsAccepted"
};

/** Splits "Chann Sreypich" into first name "Chann" and last name "Sreypich". */
function splitFullName(fullName: string) {
    const parts = fullName.trim().split(/\s+/);
    return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

/**
 * register.ftl.
 * Realm setup this page expects:
 * - "Email as username" ON (we never ask for a username)
 * - One "Full name" box fills firstName and lastName, so we ask for both names here
 */
export default function Register(props: Props) {
    const { kcContext } = props;
    const { url, realm, profile, messagesPerField, message, termsAcceptanceRequired } = kcContext;
    // `social` is sent on register.ftl too, but not typed there
    const social = (kcContext as { social?: Extract<KcContext, { pageId: "login.ftl" }>["social"] }).social;

    const attr = profile.attributesByName;
    const [fullName, setFullName] = useState([attr.firstName?.value, attr.lastName?.value].filter(Boolean).join(" "));
    const [email, setEmail] = useState(attr.email?.value ?? "");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Errors from our own checks, shown after the user presses "Create account"
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const clearError = (field: Field) => setErrors(prev => ({ ...prev, [field]: undefined }));

    const checks = useMemo(() => getPasswordChecks({ password, email }), [password, email]);
    const strength = getPasswordStrength(password, checks);
    const { firstName, lastName } = splitFullName(fullName);

    const err = (...fields: string[]) =>
        messagesPerField.existsError(fields[0], ...fields.slice(1)) ? messagesPerField.getFirstError(...fields) : undefined;

    const confirmMismatch = confirm.length > 0 && confirm !== password ? "Passwords don’t match." : undefined;

    // Keycloak's own name errors ("Please specify last name.") talk about fields
    // the user never sees, so say it in terms of the one "Full name" box
    const serverFullNameError = messagesPerField.existsError("lastName")
        ? "Please enter your first and last name, with a space between them."
        : err("firstName");

    const termsError = errors.terms ?? (termsAcceptanceRequired ? err("termsAccepted") : undefined);

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        const next: Partial<Record<Field, string>> = {
            fullName: getFullNameError(fullName),
            email: getEmailError(email),
            password: !password ? "Please create a password." : undefined,
            confirm: !confirm ? "Please confirm your password." : confirmMismatch,
            terms: !termsAccepted ? "Please accept the Terms of Service and Privacy Policy." : undefined
        };
        const firstInvalid = FIELDS.find(field => next[field]);
        if (firstInvalid) {
            event.preventDefault();
            setErrors(next);
            document.getElementById(FIELD_IDS[firstInvalid])?.focus();
            return;
        }
        setIsSubmitting(true);
    };
    const hasFieldErrors = messagesPerField.existsError(
        "firstName",
        "lastName",
        "email",
        "username",
        "password",
        "password-confirm",
        "termsAccepted"
    );

    return (
        <PageShell kcContext={kcContext} title="Sign Up">
            <SplitLayout panelSide="left">
                <PageHeader align="left" title="Sign Up" subtitle="Create your free account and start building grounded RAG chatbots." />

                <SocialButtons providers={social?.providers} dividerText="or sign up with email" />

                {!hasFieldErrors && <FormMessage message={message} />}

                <form
                    id="kc-register-form"
                    action={url.registrationAction}
                    method="post"
                    noValidate
                    onSubmit={onSubmit}
                    className="space-y-4 tall:space-y-6"
                >
                    <TextField
                        id="fullName"
                        label="Full name"
                        autoComplete="name"
                        autoFocus
                        required
                        maxLength={255}
                        placeholder="Your full name"
                        value={fullName}
                        onChange={e => {
                            setFullName(e.target.value);
                            clearError("fullName");
                        }}
                        error={errors.fullName ?? serverFullNameError}
                    />
                    <input type="hidden" name="firstName" value={firstName} />
                    <input type="hidden" name="lastName" value={lastName} />

                    <TextField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => {
                            setEmail(e.target.value);
                            clearError("email");
                        }}
                        hint="Your email is used as your username"
                        error={errors.email ?? err("email", "username")}
                    />
                    {/* Only needed if "Email as username" is OFF in the realm */}
                    {!realm.registrationEmailAsUsername && <input type="hidden" name="username" value={email} />}

                    <PasswordField
                        id="password"
                        name="password"
                        label="Password"
                        autoComplete="new-password"
                        required
                        placeholder="Create a password"
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value);
                            clearError("password");
                        }}
                        error={errors.password ?? err("password")}
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
                            clearError("confirm");
                        }}
                        error={errors.confirm ?? err("password-confirm") ?? confirmMismatch}
                    />

                    <div>
                        <label className="flex cursor-pointer items-start gap-2.5 text-p3 text-ink-body">
                            <input
                                type="checkbox"
                                id="termsAccepted"
                                name="termsAccepted"
                                required
                                checked={termsAccepted}
                                onChange={e => {
                                    setTermsAccepted(e.target.checked);
                                    clearError("terms");
                                }}
                                aria-invalid={termsError ? true : undefined}
                                aria-describedby={termsError ? "terms-error" : undefined}
                                className={cn(
                                    "mt-0.5 size-4 shrink-0 cursor-pointer rounded-xs accent-ink",
                                    termsError && "outline-2 outline-offset-1 outline-danger"
                                )}
                            />
                            {/* TODO(team): link to the real Terms and Privacy pages */}
                            <span>I agree to the Terms of Service and Privacy Policy</span>
                        </label>
                        {termsError && <FieldError id="terms-error">{termsError}</FieldError>}
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account…" : "Create account"}
                    </Button>
                </form>

                <FooterLink text="Already have an account?" href={url.loginUrl}>
                    Sign in
                </FooterLink>
            </SplitLayout>
        </PageShell>
    );
}
