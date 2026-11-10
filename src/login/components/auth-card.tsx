import type { ReactNode } from "react";
import { useEntrance } from "../lib/motion";
import { GlassLight } from "./glass-light";

/**
 * Centered see-through card used by every single-column page.
 * Height hugs the content; width follows the screen within a min and max.
 */
export function AuthCard(props: { children: ReactNode }) {
    const card = useEntrance();

    return (
        <main className="flex min-h-dvh items-center justify-center px-4 py-6 tall:sm:py-10">
            <div
                ref={card}
                data-card
                className="relative isolate w-full max-w-[clamp(32rem,45vw,42rem)] rounded-card-sm border border-line-glass bg-glass px-5 py-8 text-center shadow-auth backdrop-blur-xl sm:rounded-card sm:p-12"
            >
                <GlassLight />
                {props.children}
            </div>
        </main>
    );
}
