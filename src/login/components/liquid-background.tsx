import { useEffect, useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "../lib/motion";

/** Clicks on these never make ripples (only the open background does). */
const NO_RIPPLE =
    "[data-card], a, button, input, select, textarea, label, [role='dialog']";

/**
 * Background behind the card: the soft lavender blobs (drifting slowly, like ink
 * in water) under a frosted glass sheet. Clicking the background is like
 * touching water: one glassy ring spreads out from that spot across the page. Fades in together
 * with the card.
 */
export function LiquidBackground() {
    const root = useRef<HTMLDivElement>(null);
    const ripples = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add(MOTION_OK, () => {
                // Fade in with the card
                gsap.from(root.current, {
                    opacity: 0,
                    duration: 1.2,
                    ease: "power2.out"
                });

                gsap.utils.toArray<HTMLElement>("[data-blob]").forEach(blob => {
                    const drift = () =>
                        gsap.to(blob, {
                            xPercent: gsap.utils.random(-35, 35),
                            yPercent: gsap.utils.random(-30, 30),
                            scale: gsap.utils.random(0.85, 1.25),
                            rotation: gsap.utils.random(-25, 25),
                            duration: gsap.utils.random(9, 15),
                            ease: "sine.inOut",
                            onComplete: drift
                        });
                    drift();
                });
            });
            return () => mm.revert();
        },
        { scope: root }
    );

    // Click / tap on the background: water ripples
    useEffect(() => {
        const rootEl = root.current;
        const layer = ripples.current;
        if (!rootEl || !layer) return;
        const motionOk = window.matchMedia(MOTION_OK);

        const localPoint = (event: PointerEvent) => {
            const rect = rootEl.getBoundingClientRect();
            return { x: event.clientX - rect.left, y: event.clientY - rect.top };
        };

        // One ring per click that spreads until it covers the whole page.
        // A new click replaces the ring still spreading.
        const ripple = (x: number, y: number) => {
            gsap.killTweensOf(layer.children);
            layer.replaceChildren();

            const { width, height } = layer.getBoundingClientRect();
            // Big enough to reach the farthest corner from the click
            const size = 2 * Math.hypot(Math.max(x, width - x), Math.max(y, height - y));

            const ring = document.createElement("span");
            ring.className = "bg-ripple";
            ring.style.left = `${x}px`;
            ring.style.top = `${y}px`;
            layer.appendChild(ring);
            // Grow the real size (not scale) so the rim and blur stay thin
            gsap.fromTo(
                ring,
                { xPercent: -50, yPercent: -50, width: 0, height: 0, opacity: 1 },
                {
                    width: size,
                    height: size,
                    opacity: 0,
                    duration: 2.4,
                    ease: "power2.out",
                    onComplete: () => ring.remove()
                }
            );
        };

        const onPointerDown = (event: PointerEvent) => {
            if (!motionOk.matches || event.button !== 0) return;
            if (event.target instanceof Element && event.target.closest(NO_RIPPLE))
                return;
            const { x, y } = localPoint(event);
            ripple(x, y);
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
        };
    }, []);

    return (
        <div
            ref={root}
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
        >
            <div
                data-blob
                className="absolute -top-24 left-1/6 size-96 rounded-[42%_58%_55%_45%] bg-auth-blob opacity-80 blur-3xl will-change-transform"
            />
            <div
                data-blob
                className="absolute right-1/12 -bottom-32 size-112 rounded-[58%_42%_48%_52%] bg-auth-blob opacity-70 blur-3xl will-change-transform"
            />
            <div
                data-blob
                className="absolute bottom-1/10 left-1/12 size-80 rounded-full bg-card opacity-60 blur-3xl will-change-transform"
            />
            <div
                data-blob
                className="absolute top-1/4 right-1/5 size-64 rounded-full bg-accent-tint opacity-60 blur-3xl will-change-transform"
            />
            {/* Frosted glass sheet over the blobs */}
            <div className="bg-glass-sheet" />
            <div ref={ripples} className="absolute inset-0 overflow-hidden" />
        </div>
    );
}
