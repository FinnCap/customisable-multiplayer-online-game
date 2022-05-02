package com.communication.backend.controller;

import com.communication.backend.model.RoomMessage;
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

import static java.lang.String.format;

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

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        UsernamePasswordAuthenticationToken user = (headerAccessor.getUser() != null) ? (UsernamePasswordAuthenticationToken) headerAccessor.getUser() : null;
        if(user != null) {
            String roomId = roomController.getRoomIdByUser(null);
            if (roomId != null) {
                logger.info("User Disconnected: " + user.getName() + "; From Room: " + roomId);
                roomController.removeUserFromRoomByUser(null);

                RoomMessage msg = new RoomMessage(RoomMessage.RoomType.LEAVE,
                        new User(user.getName(), roomId),
                        RoomMessage.RoomError.NONE);
/*                msg.setType(RoomMessage.RoomType.LEAVE);
                msg.setRoomId(roomId);
                msg.setUser(new User(user.getName(), roomId));
                msg.setError(RoomMessage.RoomError.NONE);*/

                messagingTemplate.convertAndSend(format("/game/%s/userJoinedLeft", roomId), msg);
            }
        }
    }
}
