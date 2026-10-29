// Small checks shared by the sign-in and sign-up forms.
// Keycloak checks the same things again on the server.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Error text for the email box, or undefined when the email looks fine. */
export function getEmailError(email: string) {
    if (!email.trim()) return "Please enter your email.";
    if (!EMAIL_PATTERN.test(email.trim()))
        return "Please enter a valid email address, like you@company.com.";
    return undefined;
}

/** Error text for the authenticator code boxes. */
export function getCodeError(code: string, digits: number) {
    if (code.length === 0)
        return `Please enter the ${digits}-digit code from your authenticator app.`;
    if (code.length < digits)
        return `The code has ${digits} digits. Please enter all of them.`;
    return undefined;
}

/** Puts the cursor in the first box of an OtpInput (found by its label id). */
export function focusFirstCodeBox(labelId: string) {
    document
        .querySelector<HTMLInputElement>(`[aria-labelledby="${labelId}"] input`)
        ?.focus();
}

/** Error text for the full name box. Needs a first and a last name ("Chann Sreypich"). */
export function getFullNameError(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "Please enter your full name.";
    if (parts.length === 1)
        return "Please enter your first and last name, with a space between them.";
    return undefined;
}
