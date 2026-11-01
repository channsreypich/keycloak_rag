import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory, MOCK_EMAIL } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "info.ftl" });

const meta = {
    title: "Auth/03 Email verified",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmailVerified: Story = {
    args: {
        kcContext: {
            auth: { attemptedUsername: MOCK_EMAIL },
            message: { type: "success", summary: "Your email address has been verified." },
            client: { baseUrl: "#app" }
        }
    }
};

/** Keycloak sends the title as a key; it must show as "Account updated" */
export const AccountUpdated: Story = {
    args: {
        kcContext: {
            messageHeader: "accountUpdatedTitle",
            message: { type: "success", summary: "Your account has been updated." },
            skipLink: true
        }
    }
};

/** Any other info message from Keycloak */
export const OtherInfo: Story = {
    args: {
        kcContext: {
            messageHeader: "Your account was updated",
            message: { type: "info", summary: "Your password has been updated." },
            client: { baseUrl: "#app" }
        }
    }
};
