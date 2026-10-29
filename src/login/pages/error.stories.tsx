import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory, MOCK_EMAIL } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "error.ftl" });

const meta = {
    title: "Auth/04 Link expired (verify)",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Expired verification link (the reset version is under "13 Link expired (reset)") */
export const VerifyLinkExpired: Story = {
    args: {
        kcContext: {
            auth: { attemptedUsername: MOCK_EMAIL },
            message: { type: "error", summary: "Action expired. Please continue with login now." }
        }
    }
};

/** Google/GitHub sign in without a RAGStudio account (first broker login set to not create users) */
export const NoAccountFound: Story = {
    args: {
        kcContext: {
            message: {
                type: "error",
                summary: `User ${MOCK_EMAIL} authenticated with identity provider google does not exist. Please contact your administrator.`
            }
        }
    }
};

/** Any other Keycloak error */
export const OtherError: Story = {
    args: {
        kcContext: {
            message: { type: "error", summary: "Invalid parameter: redirect_uri" },
            client: { baseUrl: "#app" }
        }
    }
};
