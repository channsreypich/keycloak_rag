import type { ComponentType, SVGProps } from "react";
import { GitHubIcon, GoogleIcon } from "./brand-icons";

type Provider = {
    alias: string;
    providerId: string;
    displayName: string;
    loginUrl: string;
};

const icons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
    google: GoogleIcon,
    github: GitHubIcon
};

/**
 * Google / GitHub buttons + "or sign in with email" divider.
 * Shows only the identity providers set up in Keycloak.
 */
export function SocialButtons(props: {
    providers: Provider[] | undefined;
    dividerText: string;
}) {
    const providers = props.providers ?? [];
    if (providers.length === 0) return null;

    return (
        <div className="mb-5 tall:mb-6">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {providers.map(p => {
                    const Icon = icons[p.providerId] ?? icons[p.alias];
                    return (
                        <li key={p.alias}>
                            <a
                                id={`social-${p.alias}`}
                                href={p.loginUrl}
                                className="btn-glass relative isolate flex h-12 items-center justify-center gap-2 overflow-hidden rounded-pill border border-line bg-card text-p4 text-ink transition-[background-color,border-color,box-shadow] duration-300 [--sheen:rgb(75_63_209/0.14)] hover:border-line-glass hover:bg-card/60 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_8px_24px_-12px_rgb(75_63_209/0.3)] hover:backdrop-blur-md"
                            >
                                {Icon && <Icon className="size-4.5" />}
                                {p.displayName}
                            </a>
                        </li>
                    );
                })}
            </ul>
            <div className="mt-5 flex items-center gap-4 tall:mt-6">
                <span aria-hidden className="h-px flex-1 bg-line" />
                <span className="text-p3 text-ink-muted">{props.dividerText}</span>
                <span aria-hidden className="h-px flex-1 bg-line" />
            </div>
        </div>
    );
}
