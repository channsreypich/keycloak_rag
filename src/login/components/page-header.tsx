import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

type Tone = "accent" | "success" | "danger";

const toneClasses: Record<Tone, string> = {
    accent: "bg-accent-tint text-accent",
    success: "bg-success-text text-on-inverse",
    danger: "bg-danger text-on-inverse"
};

/** Icon tile + big title + subtitle at the top of a card. */
export function PageHeader(props: {
    title: string;
    subtitle?: ReactNode;
    icon?: LucideIcon;
    iconTone?: Tone;
    align?: "center" | "left";
}) {
    const { title, subtitle, icon: Icon, iconTone = "accent", align = "center" } = props;

    return (
        <header className={cn("mb-6 tall:sm:mb-8", align === "center" ? "text-center" : "text-left")}>
            {Icon && (
                <div
                    aria-hidden
                    className={cn(
                        "mb-5 inline-flex size-12 items-center justify-center rounded-input sm:size-14",
                        toneClasses[iconTone]
                    )}
                >
                    <Icon className="size-6" strokeWidth={1.75} />
                </div>
            )}
            <h1 className="text-h4 font-extrabold sm:text-h3 sm:font-extrabold">{title}</h1>
            {subtitle && <p className="mt-2 text-p3 text-ink-secondary sm:text-p1">{subtitle}</p>}
        </header>
    );
}
