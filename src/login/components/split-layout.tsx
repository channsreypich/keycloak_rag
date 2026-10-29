import type { ReactNode } from "react";
import logo from "../assets/logo.png";
import preview from "../assets/auth-preview.png";
import { cn } from "../lib/cn";

export function Logo(props: { className?: string }) {
    return (
        <img
            src={logo}
            alt="RAGStudio"
            draggable={false}
            className={cn("pointer-events-none h-9 w-auto select-none sm:h-10", props.className)}
        />
    );
}

/** Product pitch + dashboard picture shown next to the Sign in / Sign up forms. */
function BrandPanel() {
    return (
        <aside className="relative hidden flex-col overflow-hidden rounded-card bg-linear-to-b from-card/60 to-auth-blob p-8 lg:flex tall:p-10 xl:tall:p-12">
            <Logo className="self-start" />
            <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-pill border border-line bg-card px-3.5 py-1 text-c2 text-ink tall:mt-8">
                <span aria-hidden className="size-2 rounded-pill bg-success" />
                Free to start · no card needed
            </p>
            <h2 className="mt-4 text-h3 font-extrabold tall:mt-5 xl:tall:text-h2">
                Build a chatbot that <span className="text-ink-muted">cites its sources.</span>
            </h2>
            <p className="mt-3 max-w-md text-p3 text-ink-body tall:mt-4 xl:tall:text-p1">
                Upload your documents, test in the playground, and publish — every answer shows exactly where it
                came from.
            </p>
            {/* The picture fills whatever height is left and is cropped, so the
                form (not the picture) decides how tall the card is */}
            <div className="relative mt-8 -mr-8 -mb-8 min-h-40 flex-1 tall:-mr-10 tall:-mb-10 xl:tall:-mr-12 xl:tall:-mb-12">
                <img
                    src={preview}
                    alt="RAGStudio dashboard with a chatbot answer citing Employee_Handbook_2026.pdf"
                    // Bleeds past the right and bottom edge, like the design.
                    // No drag, right-click "Save image" or long-press menu
                    draggable={false}
                    className="pointer-events-none absolute top-0 left-0 w-[calc(100%+4rem)] max-w-none select-none"
                />
            </div>
        </aside>
    );
}

/**
 * Big card with the form on one side and the brand panel on the other.
 * Sign up has the panel on the left, Sign in on the right.
 * On small screens only the form is shown, with the logo on top.
 */
export function SplitLayout(props: { panelSide: "left" | "right"; children: ReactNode }) {
    const { panelSide, children } = props;

    return (
        <main className="flex min-h-dvh items-center justify-center px-4 py-4 tall:py-6 tall:sm:py-10">
            {/* One column below lg: same width as AuthCard so the form stays centred.
                From lg the card fills the screen height (minus main's padding, capped)
                so Sign in and Sign up are the same size whatever the form length */}
            <div className="grid w-full max-w-lg gap-4 rounded-card-sm border border-line-glass bg-glass p-2 shadow-auth backdrop-blur-xl sm:rounded-card sm:p-3 lg:min-h-[min(calc(100dvh-2rem),60rem)] lg:max-w-5xl lg:grid-cols-2 xl:max-w-6xl tall:lg:min-h-[min(calc(100dvh-5rem),60rem)]">
                {panelSide === "left" && <BrandPanel />}
                <section className="flex min-w-0 items-center justify-center px-3 py-6 sm:px-7 tall:sm:py-8 lg:px-10 tall:lg:py-12">
                    <div className="w-full min-w-0 max-w-md">
                        <Logo className="mb-6 -ml-1 lg:hidden" />
                        {children}
                    </div>
                </section>
                {panelSide === "right" && <BrandPanel />}
            </div>
        </main>
    );
}
