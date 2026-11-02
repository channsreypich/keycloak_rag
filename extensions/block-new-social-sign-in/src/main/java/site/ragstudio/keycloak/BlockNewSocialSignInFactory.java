package site.ragstudio.keycloak;

import java.util.List;
import org.keycloak.Config;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

/** Makes the step available in Authentication → Flows. */
public class BlockNewSocialSignInFactory implements AuthenticatorFactory {

    private static final BlockNewSocialSignInAuthenticator AUTHENTICATOR = new BlockNewSocialSignInAuthenticator();

    @Override
    public String getId() {
        return "ragstudio-block-new-social-sign-in";
    }

    @Override
    public String getDisplayType() {
        return "RAGStudio: block new accounts on social sign in";
    }

    @Override
    public String getHelpText() {
        return "Shows No Account Found on Google or GitHub sign in when no account uses that email. Sign up still creates one.";
    }

    @Override
    public Authenticator create(KeycloakSession session) {
        return AUTHENTICATOR;
    }

    @Override
    public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
        return new AuthenticationExecutionModel.Requirement[] {
            AuthenticationExecutionModel.Requirement.REQUIRED, AuthenticationExecutionModel.Requirement.DISABLED
        };
    }

    @Override
    public String getReferenceCategory() {
        return null;
    }

    @Override
    public boolean isConfigurable() {
        return false;
    }

    @Override
    public boolean isUserSetupAllowed() {
        return false;
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        return List.of();
    }

    @Override
    public void init(Config.Scope config) {
        // No settings
    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {
        // No setup
    }

    @Override
    public void close() {
        // Nothing to close
    }
}
