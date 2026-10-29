import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { cn } from "../lib/cn";

type Message = { type: "success" | "warning" | "error" | "info"; summary: string };

const tones = {
    error: { box: "border-danger-line bg-danger-tint text-danger-text", Icon: CircleAlert },
    warning: { box: "border-warning-line bg-warning-tint text-warning-text", Icon: CircleAlert },
    success: { box: "border-success-line bg-success-tint text-success-text", Icon: CircleCheck },
    info: { box: "border-line bg-subtle text-ink", Icon: Info }
} as const;

/** Banner for Keycloak's page message (e.g. "Invalid username or password."). */
export function FormMessage(props: { message: Message | undefined }) {
    const { message } = props;
    if (!message) return null;
    const { box, Icon } = tones[message.type];

    return (
        <div
            role={message.type === "error" ? "alert" : "status"}
            className={cn("mb-6 flex items-start gap-3 rounded-input border px-4 py-3 text-left text-p4", box)}
        >
            <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
            {/* Keycloak messages can contain simple HTML, so sanitize first */}
            <span dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }} />
        </div>
    );
}
