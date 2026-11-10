import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import ragstudioIcon from "../assets/ragstudio-icon.png";
import { gsap, MOTION_OK, useGSAP } from "../lib/motion";
import { GitHubIcon, GoogleIcon } from "./brand-icons";

const DROP_COLORS: Record<string, string> = { Google: "#4285F4", GitHub: "#111111" };

/** Icon bubble size (px). The dashed line runs through the bubble centres. */
const BUBBLE = 56;
/** Space between a bubble and the start/end of the dashed line (px). */
const LINE_GAP = 8;

function Tile(props: {
    icon: ReactNode;
    title: string;
    detail: string;
    bubble: RefObject<HTMLSpanElement>;
    ring?: ReactNode;
}) {
    const { icon, title, detail, bubble, ring } = props;
    return (
        <div className="flex min-w-0 flex-col items-center gap-3 text-center">
            <span
                ref={bubble}
                style={{ width: BUBBLE, height: BUBBLE }}
                className="relative flex shrink-0 items-center justify-center rounded-pill border border-line bg-card shadow-subtle"
            >
                {icon}
                {ring}
            </span>
            <span className="w-full min-w-0">
                <span className="block text-s2 wrap-break-word text-ink">{title}</span>
                <span className="block text-p3 break-all text-ink-secondary">
                    {detail}
                </span>
            </span>
        </div>
    );
}

/**
 * Provider (with email) - - - - ▸ RAGStudio account, centred in the card.
 *
 * The dashed line flows from the provider to RAGStudio (CSS), and a drop in the
 * provider's colour travels along it and lands in the RAGStudio icon, which
 * pulses (GSAP). Pure CSS positions, so it stays lined up at every width.
 */
export function LinkPreview(props: { provider: string; email?: string }) {
    const { provider, email } = props;
    const Icon =
        provider === "GitHub"
            ? GitHubIcon
            : provider === "Google"
              ? GoogleIcon
              : undefined;
    const dropColor = DROP_COLORS[provider] ?? "var(--accent)";

    const root = useRef<HTMLDivElement>(null);
    const fromBubble = useRef<HTMLSpanElement>(null);
    const toBubble = useRef<HTMLSpanElement>(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add(MOTION_OK, () => {
                gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: 0.9 })
                    // The provider icon squeezes out a drop…
                    .fromTo(
                        fromBubble.current,
                        { scale: 1 },
                        {
                            scale: 0.9,
                            duration: 0.15,
                            yoyo: true,
                            repeat: 1,
                            ease: "power2.out"
                        }
                    )
                    .fromTo(
                        "[data-drop]",
                        { left: "0%", scale: 0.3, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" },
                        "<0.1"
                    )
                    // …that flows along the line, stretching like water…
                    .to("[data-drop]", {
                        left: "100%",
                        duration: 1,
                        ease: "power1.inOut"
                    })
                    .to(
                        "[data-drop]",
                        {
                            scaleX: 1.6,
                            scaleY: 0.75,
                            duration: 0.5,
                            yoyo: true,
                            repeat: 1,
                            ease: "sine.inOut"
                        },
                        "<"
                    )
                    // …and lands in RAGStudio
                    .to("[data-drop]", {
                        scale: 0,
                        opacity: 0,
                        duration: 0.15,
                        ease: "power2.in"
                    })
                    .fromTo(
                        toBubble.current,
                        { scale: 1 },
                        {
                            scale: 1.12,
                            duration: 0.15,
                            yoyo: true,
                            repeat: 1,
                            ease: "power2.out"
                        },
                        "<"
                    )
                    .fromTo(
                        "[data-ring]",
                        { scale: 1, opacity: 0.6 },
                        { scale: 1.8, opacity: 0, duration: 0.9, ease: "power2.out" },
                        "<"
                    );
            });
            return () => mm.revert();
        },
        { scope: root, dependencies: [provider], revertOnUpdate: true }
    );

    // Middle column width. Both tiles are equally wide, so each bubble centre is
    // a quarter of the remaining width in from its edge.
    const lineInset = `calc((100% - var(--mid)) / 4 + ${BUBBLE / 2 + LINE_GAP}px)`;

    return (
        <div
            ref={root}
            style={{ "--mid": "clamp(2.5rem, 12vw, 6rem)" } as CSSProperties}
            className="relative mb-6 grid w-full grid-cols-[minmax(0,1fr)_var(--mid)_minmax(0,1fr)] items-start"
        >
            {/* Dashed connector from bubble to bubble, with the travelling drop */}
            <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{ top: BUBBLE / 2 - 1, left: lineInset, right: lineInset }}
            >
                <div className="dash-flow h-0.5 w-full rounded-pill" />
                {/* Arrow head */}
                <span className="absolute top-1/2 -right-0.5 size-2 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-ink-muted" />
                <span
                    data-drop
                    className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-pill opacity-0 shadow-subtle"
                    style={{ background: dropColor, left: 0 }}
                />
            </div>

            <Tile
                bubble={fromBubble}
                icon={
                    Icon ? (
                        <Icon aria-hidden className="size-6" />
                    ) : (
                        <span className="text-s1 text-ink">{provider.charAt(0)}</span>
                    )
                }
                title={provider}
                detail={email ?? "Sign-in method"}
            />
            <span aria-hidden />
            <Tile
                bubble={toBubble}
                icon={
                    <img src={ragstudioIcon} alt="" className="size-9 object-contain" />
                }
                title="RAGStudio account"
                detail="Your account"
                ring={
                    <span
                        data-ring
                        className="pointer-events-none absolute inset-0 rounded-pill border-2 opacity-0"
                        style={{ borderColor: dropColor }}
                    />
                }
            />
        </div>
    );
}
