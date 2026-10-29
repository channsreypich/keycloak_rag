import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory, MOCK_EMAIL } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-verify-email.ftl" });

const meta = {
    title: "Auth/02 Verify email",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        kcContext: {
            user: { email: MOCK_EMAIL },
            message: { type: "warning", summary: "You need to verify your email address to activate your account." }
        }
    }
};
