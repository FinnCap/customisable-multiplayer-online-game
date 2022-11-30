package com.communication.backend.controller;

import com.communication.backend.model.Notification;
import com.communication.backend.model.Room;
import com.communication.backend.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

import static java.lang.String.format;

/**
 * Class handles WebSocketConnections. The main purpose is to inform other users, when a user left their room.
 */
@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @Autowired
    private RoomController roomController;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        logger.info("Received a new web socket connection");
    }

    /**
     * Function notifies the other users if a user left their room. This will also delete the user from the game
     * statistics.
     * @param  event    The disconnect event for a given user
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal p = headerAccessor.getUser();
        if(p != null) {
            UsernamePasswordAuthenticationToken u = (UsernamePasswordAuthenticationToken) p;
            User user = roomController.getUserById((String) u.getPrincipal());
            if (user != null) {
                logger.info("User Disconnected: " + user);
                Room r = roomController.getRoomByUser(user);
                if (r != null) {
                    r.removeUserRoom(user);
                    roomController.deleteRoom(r);
                }
                Notification notification = new Notification("", user, Notification.NotificationType.LEAVE);
                messagingTemplate.convertAndSend(format("/game/%s/userJoinedLeft", user.getRoomId()), notification);
            }
        }
    }
}
