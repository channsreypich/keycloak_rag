import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PointerEvent } from "react";
import { cn } from "../lib/cn";

type Variant = "primary" | "secondary";

const base =
    "btn-glass relative isolate inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-input px-5 text-btn-sm transition-[color,background-color,border-color,box-shadow] duration-300 sm:text-btn-md";

const variants: Record<Variant, string> = {
    primary:
        "bg-inverse text-on-inverse hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_8px_24px_-10px_rgb(17_17_17/0.45)] disabled:cursor-not-allowed disabled:bg-ink-disabled disabled:hover:opacity-100",
    secondary:
        "border border-line bg-card text-ink [--sheen:rgb(75_63_209/0.14)] hover:border-line-glass hover:bg-card/60 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_8px_24px_-12px_rgb(75_63_209/0.3)] hover:backdrop-blur-md disabled:cursor-not-allowed disabled:text-ink-disabled"
};

/**
 * Water-drop ripple: a circle spreads out from where the button was pressed.
 * Only adds a span that removes itself, so it never delays the click or submit.
 */
function ripple(event: PointerEvent<HTMLElement>) {
    const el = event.currentTarget;
    if (el.matches(":disabled, [aria-disabled='true']")) return;

    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Big enough to reach the farthest corner
    const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

    const drop = document.createElement("span");
    drop.className = "ripple";
    drop.style.left = `${x}px`;
    drop.style.top = `${y}px`;
    drop.style.width = drop.style.height = `${radius * 2}px`;
    drop.addEventListener("animationend", () => drop.remove(), { once: true });
    el.appendChild(drop);
}

export function Button(
    props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
) {
    const {
        variant = "primary",
        className,
        type = "button",
        onPointerDown,
        ...rest
    } = props;
    return (
        <button
            type={type}
            className={cn(base, variants[variant], className)}
            onPointerDown={e => {
                ripple(e);
                onPointerDown?.(e);
            }}
            {...rest}
        />
    );
}

/** Looks like a Button but is a link (for plain navigation). */
export function ButtonLink(
    props: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }
) {
    const { variant = "primary", className, onPointerDown, ...rest } = props;
    return (
        <a
            className={cn(base, variants[variant], className)}
            onPointerDown={e => {
                ripple(e);
                onPointerDown?.(e);
            }}
            {...rest}
        />
    );
}
