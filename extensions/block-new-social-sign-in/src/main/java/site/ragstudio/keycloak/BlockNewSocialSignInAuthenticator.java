package site.ragstudio.keycloak;

import jakarta.ws.rs.core.Response;
import java.util.Arrays;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.authentication.authenticators.broker.AbstractIdpAuthenticator;
import org.keycloak.authentication.authenticators.broker.util.SerializedBrokeredIdentityContext;
import org.keycloak.broker.provider.BrokeredIdentityContext;
import org.keycloak.events.Errors;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;

/**
 * Stops Google/GitHub sign in when no RAGStudio account uses that email, so the
 * user sees "No Account Found" instead of getting a new account.
 *
 * The web app's sign-up route opens Keycloak with prompt=create. Only that flow
 * may create a new account. This must run first in the first broker login flow.
 */
public class BlockNewSocialSignInAuthenticator extends AbstractIdpAuthenticator {

    private static final String PROMPT_NOTE = "prompt";
    private static final String PROMPT_CREATE = "create";
    private static final String NO_ACCOUNT_MESSAGE = "federatedIdentityUnavailableMessage";

    @Override
    protected void authenticateImpl(
            AuthenticationFlowContext context,
            SerializedBrokeredIdentityContext serializedCtx,
            BrokeredIdentityContext brokerContext) {
        String email = brokerContext.getEmail();

        if (isSigningUp(context) || hasAccount(context, email)) {
            context.success();
            return;
        }

        context.getEvent().error(Errors.USER_NOT_FOUND);
        String name = email != null ? email : brokerContext.getUsername();
        Response page = context.form()
                .setError(NO_ACCOUNT_MESSAGE, name, brokerContext.getIdpConfig().getAlias())
                .createErrorPage(Response.Status.FORBIDDEN);
        context.failureChallenge(AuthenticationFlowError.UNKNOWN_USER, page);
    }

    private boolean isSigningUp(AuthenticationFlowContext context) {
        String prompt = context.getAuthenticationSession().getClientNote(PROMPT_NOTE);
        return prompt != null && Arrays.asList(prompt.split(" ")).contains(PROMPT_CREATE);
    }

    /** An existing account goes on to the Link Account step. */
    private boolean hasAccount(AuthenticationFlowContext context, String email) {
        return email != null && context.getSession().users().getUserByEmail(context.getRealm(), email) != null;
    }

    @Override
    protected void actionImpl(
            AuthenticationFlowContext context,
            SerializedBrokeredIdentityContext serializedCtx,
            BrokeredIdentityContext brokerContext) {
        // This step has no form
    }

    @Override
    public boolean requiresUser() {
        return false;
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        return true;
    }
}
