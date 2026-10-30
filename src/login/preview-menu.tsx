// MOCK MODE ONLY (see dev-mock.ts). Never part of the theme jar.
// A small "Preview · mock data" button that lists every screen, so each one
// can be opened directly, even screens that real users only reach from an email.

import { useEffect, useRef, useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { cn } from "./lib/cn";

type Screen = { label: string; href: string };

const SCREENS: { group: string; items: Screen[] }[] = [
    {
        group: "Sign in",
        items: [
            { label: "Sign in", href: "/" },
            { label: "Wrong password", href: "/?state=wrong-password" },
            { label: "Attempts left", href: "/?state=attempts-left" },
            { label: "Locked", href: "/?state=locked" },
            { label: "Account suspended", href: "/?state=suspended" },
            { label: "Account pending deletion", href: "/?state=pending-deletion" },
            {
                label: "No account found (Google)",
                href: "/?page=error.ftl&state=no-account"
            }
        ]
    },
    {
        group: "Sign up",
        items: [
            { label: "Sign up", href: "/login-actions/registration" },
            {
                label: "Email already used",
                href: "/login-actions/registration?state=email-taken"
            },
            { label: "Verify email", href: "/?page=login-verify-email.ftl" },
            { label: "Email verified", href: "/?page=info.ftl" },
            {
                label: "Verify link expired",
                href: "/?page=error.ftl&state=verify-link-expired"
            }
        ]
    },
    {
        group: "Forgot password",
        items: [
            { label: "Forgot password", href: "/login-actions/reset-credentials" },
            { label: "Check your email", href: "/?state=email-sent" },
            { label: "Reset password", href: "/?page=login-update-password.ftl" },
            {
                label: "Reset link expired",
                href: "/login-actions/reset-credentials?state=link-expired"
            }
        ]
    },
    {
        group: "Admin sign in",
        items: [
            { label: "Admin sign-in", href: "/?client=admin" },
            {
                label: "Admin: wrong password",
                href: "/?client=admin&state=attempts-left"
            },
            { label: "Admin: locked", href: "/?client=admin&state=locked" },
            {
                label: "Admin: forgot password",
                href: "/login-actions/reset-credentials?client=admin"
            }
        ]
    },
    {
        group: "Admin MFA",
        items: [
            {
                label: "Set up authenticator (first sign-in)",
                href: "/?page=login-config-totp.ftl"
            },
            {
                label: "Set up: wrong code",
                href: "/?page=login-config-totp.ftl&state=wrong-code"
            },
            { label: "Enter code (later sign-ins)", href: "/?page=login-otp.ftl" },
            {
                label: "Enter code: wrong code",
                href: "/?page=login-otp.ftl&state=wrong-code"
            }
        ]
    },
    {
        group: "Other",
        items: [
            { label: "Page expired", href: "/?page=login-page-expired.ftl" },
            { label: "Something went wrong", href: "/?page=error.ftl" },
            {
                label: "Error: setup problem (redirect_uri)",
                href: "/?page=error.ftl&state=setup-problem"
            },
            {
                label: "Error: cookies turned off",
                href: "/?page=error.ftl&state=cookies"
            },
            {
                label: "Error: sign-in timed out",
                href: "/?page=error.ftl&state=timed-out"
            }
        ]
    }
];

function isCurrent(href: string) {
    const target = new URL(href, window.location.origin);
    return (
        target.pathname === window.location.pathname &&
        target.search === window.location.search
    );
}

export function PreviewMenu() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Escape closes the menu and puts focus back on the button
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    return (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2 text-left">
            {open && (
                <nav
                    id="preview-menu"
                    aria-label="Preview screens"
                    className="max-h-[70vh] w-72 overflow-y-auto rounded-card-sm border border-line bg-card p-3 shadow-elevated"
                >
                    <p className="px-2 pb-2 text-c1 text-ink-secondary">
                        Mock data only. Nothing here signs you in for real.
                    </p>
                    {SCREENS.map(({ group, items }) => (
                        <div key={group} className="py-1">
                            <p className="px-2 py-1 font-mono text-eyebrow text-ink-muted uppercase">
                                {group}
                            </p>
                            <ul>
                                {items.map(item => {
                                    const current = isCurrent(item.href);
                                    return (
                                        <li key={item.href}>
                                            <a
                                                href={item.href}
                                                aria-current={
                                                    current ? "page" : undefined
                                                }
                                                className={cn(
                                                    "block rounded-small px-2 py-1.5 text-p3 text-ink-body hover:bg-subtle",
                                                    current &&
                                                        "bg-subtle font-semibold text-ink"
                                                )}
                                            >
                                                {item.label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                    <p className="border-t border-line px-2 pt-2 text-c1 text-ink-secondary">
                        Tip: sign in with an email that starts with “admin” to see the
                        admin MFA steps.
                    </p>
                </nav>
            )}
            <button
                ref={buttonRef}
                type="button"
                aria-expanded={open}
                aria-controls="preview-menu"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 rounded-pill bg-inverse px-4 py-2 text-c2 text-on-inverse shadow-elevated hover:opacity-90"
            >
                {open ? (
                    <X aria-hidden className="size-4" />
                ) : (
                    <FlaskConical aria-hidden className="size-4" />
                )}
                Preview · mock data
            </button>
        </div>
    );
}
