import { Check } from "lucide-react";
import { cn } from "../lib/cn";
import type { PasswordCheck, Strength } from "../lib/password-rules";

const levels: Record<Exclude<Strength, 0>, { label: string; bar: string; text: string }> = {
    1: { label: "Weak", bar: "bg-danger", text: "text-danger-text" },
    2: { label: "Fair", bar: "bg-warning", text: "text-warning-text" },
    3: { label: "Good", bar: "bg-warning", text: "text-warning" },
    4: { label: "Strong", bar: "bg-success", text: "text-success" }
};

/** 4-step strength bar + list of rules with check marks. */
export function PasswordStrength(props: { strength: Strength; checks: PasswordCheck[] }) {
    const { strength, checks } = props;
    const level = strength === 0 ? undefined : levels[strength];

    return (
        <div className="mt-3">
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map(step => (
                    <span
                        key={step}
                        aria-hidden
                        className={cn("h-1.5 flex-1 rounded-pill", level && step <= strength ? level.bar : "bg-muted")}
                    />
                ))}
                <span
                    aria-live="polite"
                    className={cn("w-16 text-right text-label uppercase", level ? level.text : "text-ink-muted")}
                >
                    {level?.label ?? ""}
                    {level && <span className="sr-only"> password</span>}
                </span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                {checks.map(check => (
                    <li
                        key={check.label}
                        className={cn("flex items-center gap-1.5 text-p3", check.ok ? "text-ink-body" : "text-ink-muted")}
                    >
                        <Check aria-hidden className={cn("size-4", check.ok ? "text-success" : "text-ink-disabled")} />
                        {check.label}
                        <span className="sr-only">{check.ok ? "(done)" : "(not yet)"}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
