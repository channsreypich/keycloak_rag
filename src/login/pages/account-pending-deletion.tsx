import { TriangleAlert } from "lucide-react";
import { AuthCard } from "../components/auth-card";
import { ButtonLink } from "../components/button";
import { FooterLink } from "../components/footer-link";
import { PageHeader } from "../components/page-header";
import { StatusBox } from "../components/status-box";
import { SUPPORT_URL } from "../lib/constants";

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

/** Shown instead of the Sign in form when the account is waiting to be deleted. */
export function AccountPendingDeletion(props: {
    signOutUrl: string;
    pendingDeletion: { deleteOn: string; restoreUrl: string };
}) {
    const { signOutUrl, pendingDeletion } = props;
    const days = daysUntil(pendingDeletion.deleteOn);
    const daysText = `${days} ${days === 1 ? "day" : "days"}`;

    return (
        <AuthCard>
            <PageHeader
                icon={TriangleAlert}
                iconTone="danger"
                title="Account Pending Deletion"
                subtitle="You asked to delete this account. Your published chatbots are offline until you restore it or it is deleted."
            />
            <div className="space-y-4">
                <StatusBox
                    tone="danger"
                    label="Permanent deletion on"
                    value={
                        <time dateTime={pendingDeletion.deleteOn}>{formatDate(pendingDeletion.deleteOn)}</time>
                    }
                    aside={<span className="text-c2 text-ink">{daysText} left</span>}
                />
                <ButtonLink href={pendingDeletion.restoreUrl}>Restore account</ButtonLink>
                <ButtonLink href={signOutUrl} variant="secondary">
                    Sign out
                </ButtonLink>
            </div>
            <p className="mt-6 text-p3 text-ink-secondary">
                If you sign out, the account stays pending deletion and can still be restored within {daysText}.
            </p>
            <FooterLink text="Questions?" href={SUPPORT_URL}>
                Contact support
            </FooterLink>
        </AuthCard>
    );
}
