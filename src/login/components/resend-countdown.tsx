import { formatSeconds, useCountdown } from "../lib/countdown";

const RESEND_WAIT_SECONDS = 45;

/**
 * "Didn't get it? Check spam, or resend in 00:45".
 * After the wait, "resend now" becomes a link to `href`.
 */
export function ResendCountdown(props: { href: string; seconds?: number; onResend?: () => void }) {
    const { href, seconds = RESEND_WAIT_SECONDS, onResend } = props;
    const left = useCountdown(seconds);

    return (
        <p className="mt-5 text-center text-p3 text-ink-secondary">
            Didn&apos;t get it? Check spam, or{" "}
            {left > 0 ? (
                <span className="text-ink-muted">
                    resend in <span className="tabular-nums">{formatSeconds(left)}</span>
                </span>
            ) : (
                <a href={href} onClick={onResend} className="font-medium text-ink hover:underline">
                    resend now
                </a>
            )}
        </p>
    );
}
