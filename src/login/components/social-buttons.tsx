import type { ComponentType, SVGProps } from "react";
import { GitHubIcon, GoogleIcon } from "./brand-icons";

type Provider = { alias: string; providerId: string; displayName: string; loginUrl: string };

const icons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
    google: GoogleIcon,
    github: GitHubIcon
};

/**
 * Google / GitHub buttons + "or sign in with email" divider.
 * Shows only the identity providers set up in Keycloak.
 */
export function SocialButtons(props: { providers: Provider[] | undefined; dividerText: string }) {
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
                                className="flex h-12 items-center justify-center gap-2 rounded-pill border border-line bg-card text-p4 text-ink transition-colors hover:bg-subtle"
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
