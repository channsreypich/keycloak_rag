import type { Meta, StoryObj } from "@storybook/react";
import { EmailPreview } from "./email-preview";

// The verify email message, as Keycloak sends it (src/email/html/email-verification.ftl).
// After changing the template, run `npm run preview-emails` and reload.
const meta = {
    title: "Emails/Verify email",
    component: EmailPreview,
    parameters: { layout: "fullscreen" },
    args: { file: "email-verification.html", width: 720 }
} satisfies Meta<typeof EmailPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};

export const Phone: Story = { args: { width: 375 } };
