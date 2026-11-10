import { useState } from "react";
import { RotateCcw, Undo2, type LucideIcon } from "lucide-react";
import { AuthCard } from "../components/auth-card";
import { Button, ButtonLink } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { FormMessage } from "../components/form-message";
import { PageHeader } from "../components/page-header";
import { cn } from "../lib/cn";
import { SUPPORT_URL } from "../lib/constants";

/** Shortest time the "Restoring" screen stays up, so it does not just flash. */
const RESTORING_MIN_MS = 1000;

function formatDate(iso: string) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
        ? iso
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Whole days from today until `iso` (0 if it is today or past). */
function daysUntil(iso: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(iso);
    target.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86_400_000));
}

function RoundIcon(props: { tone: "warning" | "accent"; icon: LucideIcon }) {
    const { tone, icon: Icon } = props;
    return (
        <span
            aria-hidden
            className={cn(
                "mx-auto mb-5 flex size-14 items-center justify-center rounded-pill",
                tone === "warning" ? "bg-warning-tint text-warning-text" : "bg-accent-tint text-accent"
            )}
        >
            <Icon className="size-6" />
        </span>
    );
}

function Row(props: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border-t border-line py-3 first:border-t-0">
            <dt className="text-p4 text-ink">{props.label}</dt>
            <dd className="min-w-0 text-right text-p3 break-words text-ink-secondary">{props.children}</dd>
        </div>
    );
}

/** Shown after signing in when the account is waiting to be deleted. */
export function AccountPendingDeletion(props: {
    email?: string;
    message?: { type: "success" | "warning" | "error" | "info"; summary: string };
    signOutUrl: string;
    pendingDeletion: { deleteOn: string; restoreUrl: string };
}) {
    const { email, message, signOutUrl, pendingDeletion } = props;
    const [restoring, setRestoring] = useState(false);
    const days = daysUntil(pendingDeletion.deleteOn);
    const daysText = `${days} ${days === 1 ? "day" : "days"}`;

    function restore() {
        setRestoring(true);
        setTimeout(() => window.location.assign(pendingDeletion.restoreUrl), RESTORING_MIN_MS);
    }

    if (restoring) {
        return (
            <AuthCard>
                <div role="status">
                    <RoundIcon tone="accent" icon={RotateCcw} />
                    <PageHeader
                        title="Restoring your account…"
                        subtitle="This usually takes a few seconds. Please keep this page open."
                    />
                    <div
                        role="progressbar"
                        aria-label="Restoring your account"
                        className="mb-6 h-1.5 overflow-hidden rounded-pill bg-muted"
                    >
                        <div className="h-full w-3/5 animate-pulse rounded-pill bg-inverse" />
                    </div>
                    <Button disabled>Restoring…</Button>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard>
            <RoundIcon tone="warning" icon={Undo2} />
            <PageHeader
                title="Restore your account?"
                subtitle="Your account is scheduled for deletion. Restore it now to keep your chatbots, documents and conversation logs."
            />
            <FormMessage message={message} />
            <dl className="mb-6 rounded-input border border-line px-5 text-left">
                {email && <Row label="Account">{email}</Row>}
                <Row label="Deletion date">
                    <time dateTime={pendingDeletion.deleteOn}>{formatDate(pendingDeletion.deleteOn)}</time>
                    {` · ${daysText} left`}
                </Row>
                <Row label="Chatbots after restore">
                    <span className="rounded-pill border border-current/30 bg-warning-tint px-1.5 py-0.5 font-mono text-eyebrow text-warning-text uppercase">
                        Paused
                    </span>
                </Row>
            </dl>
            <div className="space-y-4">
                <Button onClick={restore}>Restore account</Button>
                <ButtonLink href={signOutUrl} variant="secondary">
                    Not now, sign out
                </ButtonLink>
            </div>
            <FooterLink text="Questions?" href={SUPPORT_URL}>
                Contact support
            </FooterLink>
        </AuthCard>
    );
}
