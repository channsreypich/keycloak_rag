import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import Template from "keycloakify/login/Template";
const UserProfileFormFields = lazy(() => import("keycloakify/login/UserProfileFormFields"));

// RAGStudio pages (see src/login/pages)
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));
const LoginVerifyEmail = lazy(() => import("./pages/login-verify-email"));
const Info = lazy(() => import("./pages/info"));
const ErrorPage = lazy(() => import("./pages/error"));
const LoginResetPassword = lazy(() => import("./pages/login-reset-password"));
const LoginUpdatePassword = lazy(() => import("./pages/login-update-password"));
const LoginConfigTotp = lazy(() => import("./pages/login-config-totp"));
const LoginOtp = lazy(() => import("./pages/login-otp"));
const LoginPageExpired = lazy(() => import("./pages/login-page-expired"));

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return <Login kcContext={kcContext} i18n={i18n} />;
                    case "register.ftl":
                        return <Register kcContext={kcContext} i18n={i18n} />;
                    case "login-verify-email.ftl":
                        return <LoginVerifyEmail kcContext={kcContext} i18n={i18n} />;
                    case "info.ftl":
                        return <Info kcContext={kcContext} i18n={i18n} />;
                    case "error.ftl":
                        return <ErrorPage kcContext={kcContext} i18n={i18n} />;
                    case "login-reset-password.ftl":
                        return <LoginResetPassword kcContext={kcContext} i18n={i18n} />;
                    case "login-update-password.ftl":
                        return <LoginUpdatePassword kcContext={kcContext} i18n={i18n} />;
                    case "login-config-totp.ftl":
                        return <LoginConfigTotp kcContext={kcContext} i18n={i18n} />;
                    case "login-otp.ftl":
                        return <LoginOtp kcContext={kcContext} i18n={i18n} />;
                    case "login-page-expired.ftl":
                        return <LoginPageExpired kcContext={kcContext} i18n={i18n} />;
                    // Other Keycloak pages (account linking, terms, logout, ...)
                    // still use the default Keycloak look for now.
                    default:
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={true}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}

const classes = {} satisfies { [key in ClassKey]?: string };
