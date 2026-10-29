import type { ReactNode } from "react";

/** "Already have an account? Sign in" line under a form. */
export function FooterLink(props: { text: string; href: string; children: ReactNode }) {
    return (
        <p className="mt-6 text-center text-p3 text-ink-muted">
            {props.text}{" "}
            <a href={props.href} className="font-medium text-ink hover:underline">
                {props.children}
            </a>
        </p>
    );
}
