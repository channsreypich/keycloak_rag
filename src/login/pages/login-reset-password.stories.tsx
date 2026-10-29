import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory, MOCK_EMAIL } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-reset-password.ftl" });

const meta = {
    title: "Auth/11 Forgot password",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { kcContext: { auth: { attemptedUsername: MOCK_EMAIL } } } };

/** #13: an expired reset link can bring the user back here */
export const ResetLinkExpired: Story = {
    name: "13 Link expired (reset)",
    args: {
        kcContext: {
            message: { type: "error", summary: "Action expired. Please continue with login now." }
        }
    }
};
