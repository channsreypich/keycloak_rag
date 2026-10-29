import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory, mockFieldErrors } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-config-totp.ftl" });

const meta = {
    title: "Auth/09 Set up authenticator",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { kcContext: { totp: { totpSecretEncoded: "JBSW Y3DP EHPK 3PXP" } } } };

export const WrongCode: Story = {
    args: {
        kcContext: {
            totp: { totpSecretEncoded: "JBSW Y3DP EHPK 3PXP" },
            messagesPerField: mockFieldErrors({ totp: "Invalid authenticator code." })
        }
    }
};
