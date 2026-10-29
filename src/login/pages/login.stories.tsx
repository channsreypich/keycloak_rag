import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory, MOCK_EMAIL, mockFieldErrors, mockSocialProviders } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login.ftl" });

const meta = {
    title: "Auth/06 Sign in",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

const base = {
    social: { displayInfo: true, providers: mockSocialProviders },
    realm: { rememberMe: true, resetPasswordAllowed: true, registrationAllowed: true },
    login: { rememberMe: "on" }
};

export const Default: Story = { args: { kcContext: base } };

export const WrongPassword: Story = {
    args: {
        kcContext: {
            ...base,
            login: { username: MOCK_EMAIL },
            message: { type: "error", summary: "Invalid username or password." },
            messagesPerField: mockFieldErrors({ username: "Invalid username or password." })
        }
    }
};

/** Needs `bruteForce.attemptsLeft` from the backend (see KcContext.ts). */
export const WrongPasswordAttemptsLeft: Story = {
    args: {
        kcContext: {
            ...base,
            login: { username: MOCK_EMAIL },
            message: { type: "error", summary: "Invalid username or password." },
            messagesPerField: mockFieldErrors({ username: "Invalid username or password." }),
            bruteForce: { attemptsLeft: 3 }
        }
    }
};

/** #20 Account locked: Keycloak's "temporarily disabled" message starts the lock countdown. */
export const TooManyAttempts: Story = {
    args: {
        kcContext: {
            ...base,
            message: {
                type: "error",
                summary: "Account is temporarily disabled; contact your administrator or retry later."
            }
        }
    }
};

/** #7: Keycloak shows "account disabled" on login.ftl. */
export const AccountSuspended: Story = {
    name: "07 Account suspended",
    args: {
        kcContext: {
            login: { username: MOCK_EMAIL },
            message: { type: "error", summary: "Account is disabled, contact your administrator." },
            suspension: { reason: "Repeated reports of inaccurate answers on 2 chatbots", suspendedAt: "2026-10-08" }
        }
    }
};

/** Needs `pendingDeletion` from the backend (see KcContext.ts). */
export const AccountPendingDeletion: Story = {
    name: "Account pending deletion",
    args: {
        kcContext: {
            pendingDeletion: { deleteOn: "2026-10-17", restoreUrl: "#restore" }
        }
    }
};

/** #12: after "Send reset link", Keycloak goes back to login.ftl with this message. */
export const CheckYourEmail: Story = {
    name: "12 Check your email (forgot password)",
    args: {
        kcContext: {
            auth: { attemptedUsername: MOCK_EMAIL },
            message: { type: "success", summary: "You should receive an email shortly with further instructions." }
        }
    }
};
