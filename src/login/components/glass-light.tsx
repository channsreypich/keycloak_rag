import { useEffect, useRef } from "react";

/**
 * Light on glass: a soft white sheen follows the mouse across the card and the
 * card's edge glows near it. Put it inside a `relative isolate` card; it sits
 * behind the content. Mouse only (no effect on touch screens).
 */
export function GlassLight() {
    const light = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = light.current;
        const card = el?.parentElement;
        if (
            !el ||
            !card ||
            !window.matchMedia("(hover: hover) and (pointer: fine)").matches
        )
            return;

        let frame = 0;
        const onMove = (event: PointerEvent) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
                el.style.setProperty("--my", `${event.clientY - rect.top}px`);
                el.dataset.on = "";
            });
        };
        const onLeave = () => {
            cancelAnimationFrame(frame);
            delete el.dataset.on;
        };

        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        return () => {
            cancelAnimationFrame(frame);
            card.removeEventListener("pointermove", onMove);
            card.removeEventListener("pointerleave", onLeave);
        };
    }, []);

    return <div ref={light} aria-hidden data-fx className="glass-light" />;
}
