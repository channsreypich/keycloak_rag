import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory, mockFieldErrors } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-otp.ftl" });

const meta = {
    title: "Auth/10 Sign in with MFA",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { kcContext: { otpLogin: { userOtpCredentials: [{ id: "1", userLabel: "Phone" }] } } }
};

export const WrongCode: Story = {
    args: {
        kcContext: {
            otpLogin: { userOtpCredentials: [{ id: "1", userLabel: "Phone" }] },
            messagesPerField: mockFieldErrors({ totp: "Invalid authenticator code." })
        }
    }
};
