// Client-side password checks. They only guide the user: Keycloak's
// password policy is the real check and must match these rules
// (length(8) and maxLength(64), notEmail, passwordBlacklist).

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

// Short list for instant feedback. Keycloak's blacklist file is the real one.
const COMMON_PASSWORDS = new Set([
    "password",
    "password1",
    "password123",
    "12345678",
    "123456789",
    "1234567890",
    "qwerty123",
    "qwertyuiop",
    "11111111",
    "iloveyou",
    "admin123",
    "welcome1",
    "letmein1",
    "abc12345"
]);

export type PasswordCheck = { label: string; ok: boolean };

export function getPasswordChecks(params: {
    password: string;
    email?: string;
    withCommonCheck?: boolean;
}): PasswordCheck[] {
    const { password, email, withCommonCheck = true } = params;
    const lower = password.toLowerCase();
    const emailLower = email?.trim().toLowerCase() ?? "";
    const emailName = emailLower.split("@")[0];

    const checks: PasswordCheck[] = [
        {
            label: `${PASSWORD_MIN}–${PASSWORD_MAX} characters`,
            ok: password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX
        },
        {
            label: "Not your email",
            ok: password.length > 0 && (emailLower === "" || (lower !== emailLower && lower !== emailName))
        }
    ];

    if (withCommonCheck) {
        checks.push({
            label: "Not a common password",
            ok: password.length > 0 && !COMMON_PASSWORDS.has(lower)
        });
    }

    return checks;
}

export type Strength = 0 | 1 | 2 | 3 | 4;

/** 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong */
export function getPasswordStrength(password: string, checks: PasswordCheck[]): Strength {
    if (password.length === 0) return 0;
    if (checks.some(c => !c.ok)) return 1;

    const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(re => re.test(password)).length;
    let score = 1;
    if (password.length >= 10) score++;
    if (password.length >= 14) score++;
    if (kinds >= 3) score++;
    return Math.min(score, 4) as Strength;
}
