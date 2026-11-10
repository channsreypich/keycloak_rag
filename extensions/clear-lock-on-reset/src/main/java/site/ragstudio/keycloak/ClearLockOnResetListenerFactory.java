package site.ragstudio.keycloak;

import org.keycloak.Config;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventListenerProviderFactory;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;

/** Registers the listener. Turn it on in Realm settings → Events → Event listeners. */
public class ClearLockOnResetListenerFactory implements EventListenerProviderFactory {

    @Override
    public EventListenerProvider create(KeycloakSession session) {
        return new ClearLockOnResetListener(session);
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

    @Override
    public String getId() {
        return "ragstudio-clear-lock-on-reset";
    }
}
