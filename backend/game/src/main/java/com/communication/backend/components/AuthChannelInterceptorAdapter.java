package com.communication.backend.components;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import javax.inject.Inject;


/**
 * Class checks before sending a message if the call was a CONNECT call and in that case calls
 * the @see com.communication.backend.components.WebSocketAuthenticatorService to create a new
 * UsernamePasswordAuthenticationToken. Otherwise, the message will just be returned.
 * Nothing needs to be changed here.
 */
@Component
public class AuthChannelInterceptorAdapter implements ChannelInterceptor {
    private final WebSocketAuthenticatorService webSocketAuthenticatorService;

    @Inject
    public AuthChannelInterceptorAdapter(final WebSocketAuthenticatorService webSocketAuthenticatorService) {
        this.webSocketAuthenticatorService = webSocketAuthenticatorService;
    }

    /**
     * Function calls getAuthenticatedOrFail in the @see com.communication.backend.components.WebSocketAuthenticatorService
     * to get a new UsernamePasswordAuthenticationToken before sending a message to a new user on a CONNECT
     * call. Otherwise, the message will just be returned.
     */
    @Override
    public Message<?> preSend(final Message<?> message, final MessageChannel channel) throws AuthenticationException {
        final StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT == accessor.getCommand()) {
            final String id = accessor.getSessionId();

            final UsernamePasswordAuthenticationToken user = webSocketAuthenticatorService.getAuthenticatedOrFail(id);
            accessor.setUser(user);
        }
        return message;
    }
}
