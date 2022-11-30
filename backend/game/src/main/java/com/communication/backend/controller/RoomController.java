package com.communication.backend.controller;

import com.communication.backend.model.Notification;
import com.communication.backend.model.Room;
import com.communication.backend.model.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

import java.util.ArrayList;
import java.util.HashMap;

import static java.lang.String.format;

/**
 * Class provides all STOMP endpoints, handles all the communication between the rooms, creates new rooms
 * and adds users to the room.
 * Nothing needs to be changed here.
 */
@Controller
public class RoomController {

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    /** List contains all rooms which currently exist */
    private final ArrayList<Room> rooms = new ArrayList<>();

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    /**
     * Endpoint receives a join request from a user and forwards it to the admin if the respective room.
     * If the room does not exist and error is returned to the user.
     * @param  n    The notification @see com.communication.backend.model.Notification which is given as payload
     */
    @MessageMapping("/game/userAskJoin")
    public void userAskJoin(@Payload Notification n) {
        String roomId = n.roomId;
        Room r = this.getRoomByRoomId(roomId);
        n.user.setColor();
        if (r == null) {
            n.error = Notification.NotificationError.NOTEXIST;
            logger.info("User could not be added to room because the room doesn't exist: " + roomId);
            messagingTemplate.convertAndSendToUser(n.user.getId(), "/game/joinRoomResponse", n);
        } else {
            messagingTemplate.convertAndSendToUser(r.getAdmin().getId(), format("/game/%s/userAskJoin", roomId), n);
        }
    }

    /**
     * Endpoint that notifies the user that wanted to join a room, that he has been denied the access.
     * @param  n    The notification @see com.communication.backend.model.Notification which is given as payload
     */
    @MessageMapping("/game/{roomId}/denyUserRoom")
    public void denyUser(@Payload Notification n) {
        n.type = Notification.NotificationType.DENYENTRY;
        messagingTemplate.convertAndSendToUser(n.user.getId(),"/game/joinRoomResponse", n);
    }

    /**
     * Endpoint to add a user to the room which he wanted to join, if the admin allows it. Also informs the other
     * users, that a new user was added. In case the room does not exist, the user wanting to join the room is informed.
     * @param  n    The notification @see com.communication.backend.model.Notification which is given as payload
     */
    @MessageMapping("/game/{roomId}/addUserRoom")
    public void addUser(@Payload Notification n) {
        Room r = this.getRoomByRoomId(n.roomId);
        if (r == null) {
            logger.info("User could not be added to room, wrong roomId " + n.roomId);
            n.error = Notification.NotificationError.NOTEXIST;
        } else {
            boolean couldAddUser = r.addUserToRoom(n.user);
            if(!couldAddUser) {
                logger.info("User could not be added to room, wrong roomId " + n.roomId);
                n.error = Notification.NotificationError.NOTEXIST;
            } else {
                logger.info("User added to room: " + n.roomId);
                n.error = Notification.NotificationError.NONE;
                n.type = Notification.NotificationType.ADMITENTRY;
            }
        }

        messagingTemplate.convertAndSendToUser(n.user.getId(),
                "/game/joinRoomResponse",
                this.newRoomResponse(n, r));
        if (n.error == Notification.NotificationError.NONE) {
            n.type = Notification.NotificationType.JOIN;
            messagingTemplate.convertAndSend(format("/game/%s/userJoinedLeft", n.roomId), n);
        }
    }

    /**
     * Endpoint to request a new Room
     * @param  n    The notification @see com.communication.backend.model.Notification which is given as payload
     */
    @MessageMapping("/game/newRoom")
    public void newRoom(@Payload Notification n) {
        Room newRoom = new Room();
        rooms.add(newRoom);

        n.user.setRoomId(newRoom.getId());
        n.user.setColor();
        newRoom.addUserToRoom(n.user);
        logger.info("New Room requested from user: " + n.user);
        n.roomId = newRoom.getId();
        messagingTemplate.convertAndSendToUser(n.user.getId(), "/game/newRoomResponse", n);
    }

    /**
     * Endpoint to set a new game. Will update the game for all the other users.
     * @param  roomId The room for which a new game was chosen
     * @param  msg    the game which has been chosen as a json string, or an error if the game could not be
     *                created  @see com.communication.backend.model.Room@setCurrentGame
     */
    @MessageMapping("/game/{roomId}/chooseGame")
    public void chooseGame(@DestinationVariable String roomId, @Payload String msg) {
        Room r = this.getRoomByRoomId(roomId);
        String result = r.setCurrentGame(msg);
        messagingTemplate.convertAndSend("/game/" + r.getId() + "/gameUpdate", result);
    }

    /**
     * Endpoint to update the game-board. Method should be always used for
     * @param  roomId The room for which the game should be updated
     * @param  msg    Contains the update for the game which is currently played as a string. Content depends on
     *                the developer.
     */
    @MessageMapping("/game/{roomId}/updateGame")
    public void updateGameBoard(@DestinationVariable String roomId, @Payload String msg) {
        Room r = this.getRoomByRoomId(roomId);
        String result = r.updateCurrentGame(msg);
        messagingTemplate.convertAndSend("/game/" + r.getId() + "/gameUpdate", result);
    }

    /**
     * Endpoint to send a new notification to everyone in the room.
     * @param  n    The notification @see com.communication.backend.model.Notification which is given as payload
     */
    @MessageMapping("/game/{roomId}/notification")
    public void sendMessage(@Payload Notification n) {
        messagingTemplate.convertAndSend("/game/" + n.roomId + "/notification", n);
    }

    /**
     * Function finds the room object for a given user.
     * @param  user    The user for which the room object has to be found
     * @return         null if the room could not be found, otherwise the room object.
     */
    public Room getRoomByUser(User user) {
        return this.rooms.stream()
                .filter(r -> r.hasUserRoom(user))
                .findFirst().orElse(null);
    }

    /**
     * Function finds a user object for a given user id.
     * @param  id    The id as a string for the user which has to be found
     * @return       null if the user could not be found, otherwise the user object
     */
    public User getUserById(String id) {
        User user = new User("", id);

        return this.rooms.stream()
                .flatMap(r -> r.getUsers().stream())
                .filter(u -> u.equals(user))
                .findFirst()
                .orElse(null);
    }

    /**
     * Removes a room from the list of rooms if there are no users left
     * @param  room    The room object which should be deleted
     */
    public void deleteRoom(Room room) {
        if (room != null && room.getUsers().size() == 0) {
            this.rooms.remove(room);
        }
    }

    /**
     * Function finds a room object by the roomId.
     * @param  roomId    The id as a string for the room that should be found.
     * @return           The room object if found, otherwise null
     */
    private Room getRoomByRoomId(String roomId) {
        return this.rooms.stream().filter(room -> roomId.equals(room.getId())).findFirst().orElse(null);
    }

    /**
     * Function creates the response as a JSON string if a user creates a new room or joins a room.
     * The message contains all the information of a notification with the addition of all users currently in the room,
     * so that the new user has a complete list.
     * @param  n    The notification @see com.communication.backend.model.Notification which is given as payload
     * @param  r    The room the user should be added to
     * @return      A json string with the new room response, that contains the information of a notification with
     *              the addition of all users currently in the room
     */
    private String newRoomResponse(Notification n, Room r) {
        ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();

        HashMap<String, String> map = new HashMap<>();
        map.put("message", n.message);

        try {
            map.put("user", ow.writeValueAsString(n.user));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        map.put("type", n.type.toString());
        map.put("error", n.error.toString());
        map.put("roomId", r.getId());
        // only return users when no error exist and the user is allowed to join
        if (n.error == Notification.NotificationError.NONE && n.type == Notification.NotificationType.ADMITENTRY) {
            ArrayList<String> l = new ArrayList<>();
            for (User user : r.getUsers()) {
                ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
                try {
                    l.add(ow.writeValueAsString(user));
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
            }
            ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
            try {
                map.put("users", ow.writeValueAsString(l));
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }
        String json = new JSONObject(map).toString();
        json = json.replace("\\n", "");
        json = json.replace("\\", "");
        json = json.replace(" ", "");
        json = json.replace("\"{", "{").replace("}\"", "}");
        json = json.replace("\"[", "[").replace("]\"", "]");

        if (!r.getCurrentGame().equals("")) {
            json = json.substring(0, json.length() - 1);
            json += ",\"currentGame\":" + r.getCurrentGame() + "}";
        }
        return json;
    }
}

