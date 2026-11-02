// Small checks shared by the sign-in and sign-up forms.
// Keycloak checks the same things again on the server.

// Name part: letters, digits and these symbols. A dot only between other characters.
const EMAIL_NAME_CHARS = "A-Za-z0-9!#$%&'*+/=?^_`{|}~\\-";
// Domain part: labels of letters, digits and hyphens (no hyphen at the start or end of a
// label), then an ending of at least 2 characters that starts with a letter.
const EMAIL_PATTERN = new RegExp(
    `^[${EMAIL_NAME_CHARS}]+(\\.[${EMAIL_NAME_CHARS}]+)*@` +
        "([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\\.)+" +
        "[A-Za-z]([A-Za-z0-9-]*[A-Za-z0-9])$"
);
const EMAIL_MAX_LENGTH = 254;
const EMAIL_NAME_MAX_LENGTH = 64;

const EMAIL_INVALID_TEXT = "Enter a valid email address";
const BAD_EMAIL_CHAR = new RegExp(`[^${EMAIL_NAME_CHARS}.@]`);

// Google's rules for a new Gmail address, used on the Sign Up form. Other domains
// can have other rules, so they only need to be a valid email.
const GMAIL_DOMAINS = ["gmail.com", "googlemail.com"];
const GMAIL_NAME_MIN = 6;
const GMAIL_NAME_MAX = 30;

/**
 * Error to show while the user types in Sign In or Forgot Password
 * (a space, a comma, a Khmer letter, a second @, ...).
 */
export function getEmailTypingError(email: string) {
    const value = email.trim();
    return BAD_EMAIL_CHAR.test(value) || value.split("@").length > 2 ? EMAIL_INVALID_TEXT : undefined;
}

/** Sign In and Forgot Password: any valid email, because existing accounts may use any. */
export function getEmailError(email: string) {
    const value = email.trim();
    if (!value) return "Please enter your email.";
    const isValid =
        EMAIL_PATTERN.test(value) && value.length <= EMAIL_MAX_LENGTH && value.indexOf("@") <= EMAIL_NAME_MAX_LENGTH;
    return isValid ? undefined : EMAIL_INVALID_TEXT;
}

function isGmail(email: string) {
    return GMAIL_DOMAINS.includes(email.trim().split("@")[1]?.toLowerCase() ?? "");
}

/** Error to show while the user types in Sign Up. Gmail addresses get the same message as Gmail. */
export function getSignUpEmailTypingError(email: string) {
    const value = email.trim();
    return isGmail(value) && /[^A-Za-z0-9.]/.test(value.split("@")[0])
        ? "Sorry, only letters (a-z), numbers (0-9), and periods (.) are allowed."
        : getEmailTypingError(value);
}

/** Sign Up: any valid email. A Gmail address must also follow Google's username rules. */
export function getSignUpEmailError(email: string) {
    const value = email.trim();
    if (!isGmail(value)) return getEmailError(value);

    const typingError = getSignUpEmailTypingError(value);
    if (typingError) return typingError;

    const name = value.split("@")[0];
    if (name.length < GMAIL_NAME_MIN || name.length > GMAIL_NAME_MAX) {
        return `Sorry, the part before the @ must be between ${GMAIL_NAME_MIN} and ${GMAIL_NAME_MAX} characters long.`;
    }
    if (name.includes("..")) return "Sorry, an email can’t have two periods in a row.";
    if (name.startsWith(".") || name.endsWith(".")) {
        return "Sorry, the part before the @ can’t start or end with a period.";
    }
    return getEmailError(value);
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
