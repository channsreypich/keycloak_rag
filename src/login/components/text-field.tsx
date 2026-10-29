import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/cn";

export const inputClasses =
    // 16px text on phones so iOS doesn't zoom in on focus
    "h-12 w-full rounded-input border bg-card px-4 text-p1 text-ink outline-none transition-colors focus:border-line-strong sm:text-p3";

/** Uppercase label row; `aside` sits on the right (e.g. "Forgot password?"). */
export function FieldLabel(props: { htmlFor: string; children: ReactNode; aside?: ReactNode }) {
    const { htmlFor, children, aside } = props;
    return (
        <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor={htmlFor} className="text-label uppercase text-ink">
                {children}
            </label>
            {aside}
        </div>
    );
}

export function FieldError(props: { id: string; children: ReactNode }) {
    return (
        <p id={props.id} aria-live="polite" className="mt-2 flex items-center gap-2 text-p4 text-danger-text">
            <CircleAlert aria-hidden className="size-4 shrink-0" />
            <span>{props.children}</span>
        </p>
    );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    id: string;
    label: string;
    labelAside?: ReactNode;
    hint?: ReactNode;
    error?: string;
    /** Red border without a message (the message is shown elsewhere) */
    invalid?: boolean;
};

export function TextField(props: TextFieldProps) {
    const { id, label, labelAside, hint, error, invalid, className, ...rest } = props;
    const isInvalid = !!error || !!invalid;
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div className={cn("text-left", className)}>
            <FieldLabel htmlFor={id} aside={labelAside}>
                {label}
            </FieldLabel>
            <input
                id={id}
                aria-invalid={isInvalid || undefined}
                aria-describedby={describedBy}
                className={cn(inputClasses, isInvalid ? "border-danger" : "border-line")}
                {...rest}
            />
            {error ? (
                <FieldError id={`${id}-error`}>{error}</FieldError>
            ) : (
                hint && (
                    <p id={`${id}-hint`} className="mt-2 text-p3 text-ink-secondary">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}

/** Password input with a show/hide eye button. */
export function PasswordField(props: Omit<TextFieldProps, "type"> & { below?: ReactNode }) {
    const { id, label, labelAside, error, invalid, className, below, ...rest } = props;
    const isInvalid = !!error || !!invalid;
    const [visible, setVisible] = useState(false);

    return (
        <div className={cn("text-left", className)}>
            <FieldLabel htmlFor={id} aside={labelAside}>
                {label}
            </FieldLabel>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    aria-invalid={isInvalid || undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={cn(inputClasses, "pr-12", isInvalid ? "border-danger" : "border-line")}
                    {...rest}
                />
                <button
                    type="button"
                    onClick={() => setVisible(v => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    className="absolute inset-y-0 right-2 my-auto flex size-9 items-center justify-center rounded-small text-ink-muted hover:text-ink"
                >
                    {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
            </div>
            {below}
            {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
        </div>
    );
}
