import type { Meta, StoryObj } from "@storybook/react";
import { EmailPreview } from "./email-preview";

// The password reset message (Forgot password?), as Keycloak sends it (src/email/html/password-reset.ftl).
// After changing the template, run `npm run preview-emails` and reload.
const meta = {
    title: "Emails/Password reset",
    component: EmailPreview,
    parameters: { layout: "fullscreen" },
    args: { file: "password-reset.html", width: 720 }
} satisfies Meta<typeof EmailPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};

export const Phone: Story = { args: { width: 375 } };
