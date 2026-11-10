import type { ReactNode } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import ragstudioIcon from "../assets/ragstudio-icon.png";
import { GitHubIcon, GoogleIcon } from "./brand-icons";

function Tile(props: { icon: ReactNode; title: string; detail: string }) {
    const { icon, title, detail } = props;
    return (
        <div className="flex min-w-0 items-center justify-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-subtle">{icon}</span>
            <span className="min-w-0 text-left">
                <span className="block truncate text-s2 text-ink">{title}</span>
                <span className="block truncate text-p3 text-ink-secondary">{detail}</span>
            </span>
        </div>
    );
}

/**
 * "[Google · name@mail.com]  →  [RAGStudio account]", full width of the card.
 * Side by side from `sm`, stacked (arrow pointing down) on phones.
 */
export function LinkPreview(props: { provider: string; email?: string }) {
    const { provider, email } = props;
    const Icon = provider === "GitHub" ? GitHubIcon : provider === "Google" ? GoogleIcon : undefined;

    return (
        <div className="mb-6 grid w-full grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-3">
            <Tile
                icon={Icon ? <Icon aria-hidden className="size-5" /> : <span className="text-s2 text-ink">{provider.charAt(0)}</span>}
                title={provider}
                detail={email ?? "Sign-in method"}
            />
            <span className="flex justify-center text-ink-muted" aria-hidden>
                <ArrowDown className="size-5 sm:hidden" />
                <ArrowRight className="hidden size-5 sm:block" />
            </span>
            <Tile
                icon={<img src={ragstudioIcon} alt="" className="size-7 object-contain" />}
                title="RAGStudio account"
                detail="Your account"
            />
        </div>
    );
}
