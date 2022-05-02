package com.communication.backend.controller;

import com.communication.backend.model.Room;
import com.communication.backend.model.RoomMessage;
import com.communication.backend.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.UUID;
import java.util.Random;

import static java.lang.String.format;


@Controller
public class RoomController {

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    private ArrayList<Room> rooms = new ArrayList<>();
    private final Random random = new Random();

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    @MessageMapping("/game/{roomId}/sendUpdate")
    public void sendMessage(@DestinationVariable String roomId, @Payload RoomMessage roomMessage) {
        messagingTemplate.convertAndSend(format("/channel/%s", roomId), roomMessage);
    }

    /**
     * Endpoint to add a user to a room
     * @param roomId: TODO
     * @param msg: TODO
     * @param headerAccessor: TODO
     */
    @MessageMapping("/game/{roomId}/addUserWaitingRoom")
    public void addUserWaitingRoom(@DestinationVariable String roomId,
                        @Payload RoomMessage msg,
                        SimpMessageHeaderAccessor headerAccessor) {
        Room r = this.getRoomByRoomId(roomId);
        if (r == null) {
            msg.setError(RoomMessage.RoomError.NOTEXIST);
            logger.info("User could not be added to room because the room doesn't exist: " + roomId);
        } else {
            r.addUserWaitingRoom(msg.getUser().getName());
        }
//        messagingTemplate.convertAndSend(format("/game/%s/userAskJoin", roomId), msg);
        /* TODO remove for proper login process */
        messagingTemplate.convertAndSendToUser(msg.getUser().getName(), "/game/joinRoomResponse", msg);
        this.addUser(roomId, msg, headerAccessor);
    }

    @MessageMapping("/game/{roomId}/addUserRoom")
    public void addUser(@DestinationVariable String roomId,
                        @Payload RoomMessage msg,
                        SimpMessageHeaderAccessor headerAccessor) {
        Room r = this.getRoomByRoomId(roomId);
        User user = new User(msg.getUser().getName(), r.getId(), r.numberUser(), msg.getUser().getId());

        boolean couldAddUser = r.addUserToRoom(user);

        if(!couldAddUser) {
            logger.info("User could not be added to room because the room is Full or the user was associated with a wrong id: " + roomId);
            msg.setError(RoomMessage.RoomError.FULL);
        } else {
            logger.info("User added to room: " + roomId);
            msg.setError(RoomMessage.RoomError.NONE);
        }

        r.removeUserWaitingRoom(user);
        messagingTemplate.convertAndSendToUser(msg.getUser().getName(), "/game/joinRoomResponse", msg);
        if (msg.getError() == RoomMessage.RoomError.NONE) {
            messagingTemplate.convertAndSend(format("/game/%s/userJoinedLeft", roomId), msg);
        }
    }

    /**
     * Endpoint to request a new Room
     * @param msg TODO
     * @param sha TODO
     */
    @MessageMapping("/game/newRoom")
    public void newRoom(@Payload RoomMessage msg, SimpMessageHeaderAccessor sha) {
        Room newRoom = new Room(this.createNewRoomCode(), 2);
        rooms.add(newRoom);
        newRoom.addUserToRoom(new User(msg.getUser().getName(), newRoom.getId(), 0, sha.getSessionId()));
        logger.info("New Room requested from user: " + msg.getUser());

        msg.setRoomId(newRoom.getId());
        messagingTemplate.convertAndSendToUser(msg.getUser().getName(), "/game/newRoomResponse", msg);
    }

    /**
     * Endpoint to update the game-board. Method should be always used for
     * @param msg TODO
     * @param sha TODO
     */
    @MessageMapping("/game/{roomId}/chooseGame")
    public void chooseGame(@DestinationVariable String roomId, @Payload String msg, SimpMessageHeaderAccessor sha) {
        Room r = this.getRoomByRoomId(roomId);
        String result = r.setCurrentGame(msg);
        messagingTemplate.convertAndSend("/game/" + r.getId() + "/gameUpdate", result);
    }

    /**
     * Endpoint to update the game-board. Method should be always used for
     * @param msg TODO
     * @param sha TODO
     */
    @MessageMapping("/game/{roomId}/updateGame")
    public void updateGameBoard(@DestinationVariable String roomId,
                                @Payload String msg,
                                SimpMessageHeaderAccessor sha) {
        Room r = this.getRoomByRoomId(roomId);
        String result = r.updateCurrentGame(msg);
        messagingTemplate.convertAndSend("/game/" + r.getId() + "/gameUpdate", result);
    }

    /**
     * Function removes a user from a room, if he is in a room. First the room is found
     * in which the user is and then he is removed. In case the room is empty afterwards,
     * the room is also deleted. In case the user is in no room, nothing happens.
     * @param user: The user that should be removed from the room.
     */
    public void removeUserFromRoomByUser(User user) {
        Room room = this.getRoomByRoomId(user.getRoomId());
        if (room != null) {
            room.removeUserRoom(user);
            // if there are no users left in the room delete room
            if (room.numberUser() == 0) {
                this.rooms.remove(room);
            }
        }
    }

    /**
     * Function finds the roomId for a given username, if the user is in a room. Otherwise the
     * function will return null
     * @param user: The user for which the roomId has to be found
     * @return null if the user is in no room, otherwise the id from the room as a string.
     */
    public String getRoomIdByUser(User user) {
        Room room = this.rooms.stream()
                    .filter(r -> r.hasUserRoom(user))
                    .findFirst().orElse(null);
        return room != null ? room.getId() : null;
    }

    /**
     * Function finds a room object by the roomId.
     * @param roomId: The id for the room that should be found.
     * @return TODO
     */
    private Room getRoomByRoomId(String roomId) {
        return this.rooms.stream().filter(room -> roomId.equals(room.getId())).findFirst().orElse(null);
    }

    private String createNewRoomCode() {
        final String uri = "https://random-word-api.herokuapp.com/word?number=2";

        RestTemplate restTemplate = new RestTemplate();
        String[] result = restTemplate.getForObject(uri, String[].class);
        if (result != null && result.length == 2) {
            return result[0] + "-" + result[1] + "-" + this.random.nextInt(100);
        }
        return UUID.randomUUID().toString();
    }
}

