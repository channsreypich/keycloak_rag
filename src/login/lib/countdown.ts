import { useEffect, useState } from "react";

/** 75 → "01:15" */
export function formatSeconds(seconds: number) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
}

/** Seconds left, counting down once a second from `seconds` to 0. */
export function useCountdown(seconds: number) {
    const [left, setLeft] = useState(seconds);

    useEffect(() => {
        if (left <= 0) return;
        const timer = setTimeout(() => setLeft(l => l - 1), 1000);
        return () => clearTimeout(timer);
    }, [left]);

    return left;
}
