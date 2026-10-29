import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Variant = "primary" | "secondary";

const base =
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-input px-5 text-btn-sm transition-colors sm:text-btn-md";

const variants: Record<Variant, string> = {
    primary:
        "bg-inverse text-on-inverse hover:opacity-90 disabled:cursor-not-allowed disabled:bg-ink-disabled disabled:hover:opacity-100",
    secondary:
        "border border-line bg-card text-ink hover:bg-subtle disabled:cursor-not-allowed disabled:text-ink-disabled"
};

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
    const { variant = "primary", className, type = "button", ...rest } = props;
    return <button type={type} className={cn(base, variants[variant], className)} {...rest} />;
}

/** Looks like a Button but is a link (for plain navigation). */
export function ButtonLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
    const { variant = "primary", className, ...rest } = props;
    return <a className={cn(base, variants[variant], className)} {...rest} />;
}
