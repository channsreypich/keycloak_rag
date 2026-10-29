import type { DeepPartial } from "keycloakify/tools/DeepPartial";
import type { KcContext } from "./KcContext";
import KcPage from "./KcPage";
import { createGetKcContextMock } from "keycloakify/login/KcContext";
import type { KcContextExtension, KcContextExtensionPerPage } from "./KcContext";
import { themeNames, kcEnvDefaults } from "../kc.gen";

const kcContextExtension: KcContextExtension = {
    themeName: themeNames[0],
    properties: {
        ...kcEnvDefaults
    }
};
const kcContextExtensionPerPage: KcContextExtensionPerPage = {
    "login.ftl": {}
};

// MOCK DATA: shared by all stories. Real values come from Keycloak.
export const MOCK_EMAIL = "channsreypich@gmail.com";

export const mockSocialProviders = [
    {
        alias: "google",
        providerId: "google",
        displayName: "Google",
        loginUrl: "#google",
        iconClasses: ""
    },
    {
        alias: "github",
        providerId: "github",
        displayName: "GitHub",
        loginUrl: "#github",
        iconClasses: ""
    }
];

export const { getKcContextMock } = createGetKcContextMock({
    kcContextExtension,
    kcContextExtensionPerPage,
    overrides: {
        realm: { displayName: "RAGStudio", registrationEmailAsUsername: true }
    },
    overridesPerPage: {}
});

export function createKcPageStory<PageId extends KcContext["pageId"]>(params: { pageId: PageId }) {
    const { pageId } = params;

    function KcPageStory(props: { kcContext?: DeepPartial<Extract<KcContext, { pageId: PageId }>> }) {
        const { kcContext: overrides } = props;

        const kcContextMock = getKcContextMock({
            pageId,
            overrides
        });

        return <KcPage kcContext={kcContextMock} />;
    }

    return { KcPageStory };
}

/** Mock field errors, e.g. mockFieldErrors({ email: "Email already exists." }) */
export function mockFieldErrors(errors: Record<string, string>) {
    return {
        get: (field: string) => errors[field] ?? "",
        existsError: (...fields: string[]) => fields.some(f => f in errors)
    };
}
