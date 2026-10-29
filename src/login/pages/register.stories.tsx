import type { Meta, StoryObj } from "@storybook/react";
import { createKcPageStory, mockFieldErrors, mockSocialProviders } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "register.ftl" });

const meta = {
    title: "Auth/01 Sign up",
    component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

// `social` is not in the register.ftl type, but Keycloak sends it
const withSocial = { social: { displayInfo: true, providers: mockSocialProviders } } as object;

export const Default: Story = { args: { kcContext: { ...withSocial } } };

export const EmailTaken: Story = {
    args: {
        kcContext: {
            ...withSocial,
            profile: {
                attributesByName: {
                    firstName: { value: "Chann" },
                    lastName: { value: "Sreypich" },
                    email: { value: "channsreypich@gmail.com" }
                }
            },
            messagesPerField: mockFieldErrors({ email: "Email already exists." })
        }
    }
};
