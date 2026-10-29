import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "../lib/cn";

/**
 * Six boxes for a TOTP code. The full code is sent in one hidden input
 * named `name` (Keycloak expects "otp" or "totp").
 */
export function OtpInput(props: {
    name: string;
    labelId: string;
    length?: number;
    error?: boolean;
    onChange?: (code: string) => void;
}) {
    const { name, labelId, length = 6, error, onChange } = props;
    const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    const update = (next: string[]) => {
        setDigits(next);
        onChange?.(next.join(""));
    };

    const setDigit = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[index] = digit;
        update(next);
        if (digit && index < length - 1) refs.current[index + 1]?.focus();
    };

    const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace" && !digits[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
        if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
        if (event.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
    };

    const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (!pasted) return;
        event.preventDefault();
        const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
        update(next);
        refs.current[Math.min(pasted.length, length - 1)]?.focus();
    };

    return (
        <div role="group" aria-labelledby={labelId} className="mx-auto flex max-w-sm justify-center gap-1.5 sm:gap-2.5">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={el => {
                        refs.current[index] = el;
                    }}
                    value={digit}
                    onChange={e => setDigit(index, e.target.value)}
                    onKeyDown={e => onKeyDown(index, e)}
                    onPaste={onPaste}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    autoFocus={index === 0}
                    maxLength={1}
                    aria-label={`Digit ${index + 1} of ${length}`}
                    aria-invalid={error ? true : undefined}
                    className={cn(
                        // Boxes shrink to fit narrow phones instead of overflowing the card
                        "aspect-square w-full max-w-14 min-w-0 flex-1 rounded-small border bg-card text-center text-s1 font-semibold text-ink outline-none transition-colors focus:border-2 focus:border-line-strong sm:text-h4",
                        error ? "border-danger" : "border-line"
                    )}
                />
            ))}
            <input type="hidden" name={name} value={digits.join("")} />
        </div>
    );
}
