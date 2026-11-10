import { useEffect } from "react";

/**
 * Same light for the smaller glass boxes inside the card (`.glass-panel`):
 * one listener for the whole page tells the box under the mouse where the
 * pointer is; the CSS draws the sheen and edge glow while it is hovered.
 */
export function useGlassPanels() {
    useEffect(() => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        let frame = 0;
        const onMove = (event: PointerEvent) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const panel =
                    event.target instanceof Element
                        ? event.target.closest<HTMLElement>(".glass-panel")
                        : null;
                if (!panel) return;
                const rect = panel.getBoundingClientRect();
                panel.style.setProperty("--mx", `${event.clientX - rect.left}px`);
                panel.style.setProperty("--my", `${event.clientY - rect.top}px`);
            });
        };

        document.addEventListener("pointermove", onMove);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("pointermove", onMove);
        };
    }, []);
}
