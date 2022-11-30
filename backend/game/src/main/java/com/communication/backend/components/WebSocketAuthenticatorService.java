package com.communication.backend.components;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * This class creates the actual UsernamePasswordAuthenticationToken instance.
 * In case a username is not provided a AuthenticationException will be thrown.
 * The Username is the session id.
 * The password is null.
 * Every User has the Role User
 * Nothing needs to be changed here.
 */
@Component
public class WebSocketAuthenticatorService {
    // This method MUST return a UsernamePasswordAuthenticationToken instance,
    // the spring security chain is testing it with 'instanceof' later on.
    public UsernamePasswordAuthenticationToken getAuthenticatedOrFail(final String username) throws AuthenticationException {
        if (username == null || username.trim().isEmpty()) {
            throw new AuthenticationCredentialsNotFoundException("Username was null or empty.");
        }

        // null credentials, we do not pass the password along
        return new UsernamePasswordAuthenticationToken(
                username,
                null,
                Collections.singleton((GrantedAuthority) () -> "USER")
        );
    }
}
