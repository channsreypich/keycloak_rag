import type { ReactNode } from "react";
import { Info, type LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger";

const boxTones: Record<Tone, { box: string; label: string; value: string; icon: string }> = {
    neutral: { box: "border-line bg-subtle", label: "text-ink-secondary", value: "text-ink", icon: "" },
    success: {
        box: "border-success-line bg-success-tint",
        label: "text-ink-secondary",
        value: "text-success-text",
        icon: ""
    },
    warning: {
        box: "border-warning-line bg-warning-tint",
        label: "text-warning-text",
        value: "text-warning-text",
        icon: "bg-warning-tint text-warning-text"
    },
    danger: { box: "border-danger-line bg-danger-tint", label: "text-ink-secondary", value: "text-ink", icon: "" }
};

/**
 * Small labelled value box, e.g. "SENT TO  name@mail.com   [Change email]".
 * `aside` sits on the right.
 */
export function StatusBox(props: {
    label: string;
    value: ReactNode;
    tone?: Tone;
    icon?: LucideIcon;
    aside?: ReactNode;
}) {
    const { label, value, tone = "neutral", icon: Icon, aside } = props;
    const t = boxTones[tone];

    return (
        <div
            className={cn("flex items-center gap-3 rounded-input border px-4 py-3 text-left sm:gap-4 sm:px-5 sm:py-4", t.box)}
        >
            {Icon && (
                <span
                    aria-hidden
                    className={cn("flex size-10 shrink-0 items-center justify-center rounded-pill bg-card/60", t.icon)}
                >
                    <Icon className="size-5" />
                </span>
            )}
            <div className="min-w-0 flex-1">
                <p className={cn("text-label uppercase", t.label)}>{label}</p>
                <p className={cn("mt-1 text-s2 break-words", t.value)}>{value}</p>
            </div>
            {aside && <div className="shrink-0">{aside}</div>}
        </div>
    );
}

/** Grey box with an info icon, a bold title and one line of text. */
export function Callout(props: { title: string; children: ReactNode }) {
    return (
        <div className="flex gap-3 rounded-input border border-line bg-subtle px-4 py-3 text-left sm:gap-4 sm:px-5 sm:py-4">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-ink" />
            <div>
                <p className="text-p4 font-bold text-ink">{props.title}</p>
                <p className="mt-0.5 text-p3 text-ink-body">{props.children}</p>
            </div>
        </div>
    );
}
