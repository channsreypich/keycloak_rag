import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "../lib/motion";

/**
 * Success icon (Email verified, Password updated, …): a green drop falls in,
 * splashes into the tile with a ring, then the check draws itself.
 * Without motion it is simply the finished tile.
 */
export function SuccessMark() {
    const root = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add(MOTION_OK, () => {
                gsap.timeline({ delay: 0.35 })
                    .fromTo(
                        "[data-drop]",
                        { y: -64, scaleY: 0.9, opacity: 1 },
                        {
                            y: 0,
                            scaleY: 1.3,
                            scaleX: 0.85,
                            duration: 0.42,
                            ease: "power2.in"
                        }
                    )
                    .to("[data-drop]", {
                        scaleX: 2.2,
                        scaleY: 0.4,
                        opacity: 0,
                        duration: 0.12
                    })
                    .from(
                        "[data-tile]",
                        {
                            scale: 0,
                            borderRadius: "50%",
                            duration: 0.75,
                            ease: "elastic.out(1, 0.5)"
                        },
                        "<"
                    )
                    .fromTo(
                        "[data-ring]",
                        { scale: 0.8, opacity: 0.7 },
                        { scale: 1.9, opacity: 0, duration: 0.9, ease: "power2.out" },
                        "<"
                    )
                    .from(
                        "[data-check]",
                        { strokeDashoffset: 1, duration: 0.4, ease: "power2.out" },
                        "-=0.45"
                    );
            });
            return () => mm.revert();
        },
        { scope: root }
    );

    return (
        <div
            ref={root}
            aria-hidden
            className="relative mb-5 inline-flex size-12 sm:size-14"
        >
            <span
                data-ring
                className="absolute inset-0 rounded-input border-2 border-success opacity-0"
            />
            <span
                data-tile
                className="absolute inset-0 flex items-center justify-center rounded-input bg-success-text text-on-inverse"
            >
                <svg viewBox="0 0 24 24" className="size-6" fill="none">
                    <path
                        data-check
                        d="M5.5 12.5l4.2 4.2 8.8-9.4"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={0}
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span
                data-drop
                className="absolute top-1/2 left-1/2 -mt-2 -ml-1.5 h-4 w-3 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-success-text opacity-0"
            />
        </div>
    );
}
