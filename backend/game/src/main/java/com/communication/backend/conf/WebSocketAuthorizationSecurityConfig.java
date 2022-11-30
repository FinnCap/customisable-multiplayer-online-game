package com.communication.backend.conf;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

/**
 * Nothing to do here
 */
@Configuration
public class WebSocketAuthorizationSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {
    @Override
    protected void configureInbound(final MessageSecurityMetadataSourceRegistry messages) {
        super.configureInbound(messages);
        messages.simpDestMatchers("/app/game/**").authenticated(); // destination for messages over stomp
    }

    @Override
    protected boolean sameOriginDisabled() {
        return true;
    }
}

