import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory, MOCK_EMAIL } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-update-password.ftl" });

const meta = {
    title: "Auth/14 Reset password",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { kcContext: { auth: { attemptedUsername: MOCK_EMAIL } } } };
