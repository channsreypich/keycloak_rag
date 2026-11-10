import { useState } from "react";
import { CircleCheck, X } from "lucide-react";

/** Green message at the top of the screen, e.g. "Password updated". */
export function SuccessToast(props: { title: string; children: string }) {
    const [open, setOpen] = useState(true);
    if (!open) return null;

    return (
        <div
            role="status"
            className="fixed inset-x-4 top-4 z-10 mx-auto flex max-w-lg items-center gap-3 rounded-input border border-success-line bg-success-tint px-4 py-3 text-left shadow-elevated"
        >
            <CircleCheck aria-hidden className="size-6 shrink-0 text-success-text" />
            <div className="min-w-0 flex-1">
                <p className="text-p4 font-bold text-success-text">{props.title}</p>
                <p className="mt-0.5 text-p3 text-ink-body">{props.children}</p>
            </div>
            <button
                type="button"
                aria-label="Close message"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-tag p-1 text-ink hover:bg-subtle"
            >
                <X aria-hidden className="size-5" />
            </button>
        </div>
    );
}
