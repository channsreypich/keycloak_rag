package site.ragstudio.keycloak;

import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventType;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;

/**
 * Removes the sign-in lock when a user sets a new password from the emailed link.
 *
 * Keycloak only removes it when the link is opened in the same browser. In another
 * browser (for example the Gmail app) the new password would stay blocked until the
 * lock ends. The emailed link already proves the user owns the account.
 */
public class ClearLockOnResetListener implements EventListenerProvider {

    private final KeycloakSession session;

    public ClearLockOnResetListener(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public void onEvent(Event event) {
        if (event.getType() != EventType.UPDATE_PASSWORD || event.getUserId() == null) {
            return;
        }
        RealmModel realm = session.realms().getRealm(event.getRealmId());
        if (realm != null) {
            session.loginFailures().removeUserLoginFailure(realm, event.getUserId());
        }
    }

    @Override
    public void onEvent(AdminEvent event, boolean includeRepresentation) {
        // Only the user's own password change matters here
    }

    @Override
    public void close() {
        // Nothing to close
    }
}
