package com.communication.backend.model;
import com.communication.backend.games.*;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.*;

/**
 * This class represents a room, which manages players and the game that is being played, if any.
 */
public class Room {

    /**
     * The id which is associated with the room.
     * The id is generated in the Constructor and CANNOT be changed.
     */
    private final String roomId;

    /**
     * List containing all the users @see com.communication.backend.model.User which are currently in the room.
     */
    private final ArrayList<User> users = new ArrayList<>();

    /**
     * The game @see com.communication.backend.games.Game which is associated with the room. Is initially null
     */
    private Game game;

    /**
     * The admin is the user, that will get the message if a new user wants to join the room.
     * If that user leaves, the first person in the users list will become the new admin.
     */
    private User admin;

    /**
     * Constructor automatically sets the id associated with the room.
     */
    public Room() {
        /* Set room id */
        final String uri = "https://random-word-api.herokuapp.com/word?number=1";
        RestTemplate restTemplate = new RestTemplate();
        String id;
        try {
            String[] result = restTemplate.getForObject(uri, String[].class);
            if (result != null && result.length == 1) {
                id = result[0] + "-" + (new Random().nextInt(100));
            } else {
                id = String.valueOf(new Random().nextInt(100000));
            }
        } catch(HttpServerErrorException e) {
            id = String.valueOf(new Random().nextInt(100000));
        }
        this.roomId = id;
    }

    /** @return the id associated with this room */
    public String getId() {
        return this.roomId;
    }

    /**
     * Function adds a user @see com.communication.backend.model.User to the room.
     * Before the user is added, the function verifies, that the user is added to the correct room.
     * This means, that the room id associated with the user is the same as the id from this room.
     * @param  user    the user which should be added to the room
     * @return         true, if the user could be added to the room, otherwise false
     */
    public boolean addUserToRoom(User user) {
        if (!user.getRoomId().equals(this.roomId)) {
            return false;
        } else {
            this.users.add(user);
            return true;
        }
    }

    /**
     * Function removes a user @see com.communication.backend.model.User from the room.
     * If the user is not in the room nothing will be changed.
     * @param  user    the user which should be removed from the room
     */
    public void removeUserRoom(User user) {
        this.users.remove(user);
    }

    /**
     * Function checks if a user @see com.communication.backend.model.User is in the room.
     * @param  user    the user for which should be checked if he is in the room
     * @return         true, if the user is in the room, otherwise false
     */
    public boolean hasUserRoom(User user) {
        return this.users.contains(user);
    }

    /**
     * Function returns the ArrayList of users @see com.communication.backend.model.User which are
     * currently in the room.
     * @return         the ArrayList of users which are currently in the room
     */
    public ArrayList<User> getUsers() {
        return this.users;
    }

    /**
     * Function sets the current game @see com.communication.backend.games.Game for the room.
     * It expects a String in a JSON format which contains a name field that contains the class name of the game.
     * E.g.
     * {
     *     game_name: "TikTakToe", MUST be the same as class name and class must be in @see com.communication.backend.games
     * }
     * In case the game cannot be created a JSON string will be returned that contains the name, an error field set
     * to true and a message, which has the stacktrace or says not enough players depending on the error.
     * The message will be displayed in the frontend.
     * E.g.
     * {
     *     game_name: "TikTakToe",
     *     error: "true",
     *     message: "You Don't have enough players!",
     * }
     * @param  game    the game as a JSON string, which has been chosen on the frontend side
     * @return         the game as string, which can be sent to all the users and interpreted by the frontend
     */
    public String setCurrentGame(String game) {
        JSONParser parser = new JSONParser();
        try {
            JSONObject o = (JSONObject) parser.parse(game);
            String className = (String) o.get("game_name");
            if (className == null) {
                return "{ " + "\"game_name\":" + "\"JSON could not be parsed\", " +
                        "\"error\":" + "\"true\", " +
                        "\"message\":" + "\"No Class name provided\"}";
            }

            className = "com.communication.backend.games." + className;
            Constructor<?> newGame = Class.forName(className).getConstructor(ArrayList.class);

            this.game = (Game) newGame.newInstance(this.users);
            return this.game.updateGame(game);
        } catch (ParseException pe) {
            return "{ " + "\"game_name\":" + "\"JSON could not be parsed\", " +
                    "\"error\":" + "\"true\", " +
                    "\"message\":" + "\"" + pe + "\"}";
        } catch (ClassNotFoundException e) {
            return "{ " + "\"game_name\":" + "\"Class name could not be found\", " +
                    "\"error\":" + "\"true\", " +
                    "\"message\":" + "\"" + e + "\"}";
        } catch (InstantiationException | IllegalAccessException e) {
            return "{ " + "\"game_name\":" + "\"the class could not be constructed\", " +
                    "\"error\":" + "\"true\", " +
                    "\"message\":" + "\"" + e + "\"}";
        } catch (InvocationTargetException | NoSuchMethodException e) {
            if (e.getCause().getClass().equals(NotEnoughPlayerException.class)) {
                return "{ " + "\"game_name\":" + "\"Not enough players in the room\", " +
                        "\"error\":" + "\"true\", " +
                        "\"message\":" + e + "\"}";
            }
            return "{ " + "\"game_name\":" + "\"the constructor could not be found\", " +
                    "\"error\":" + "\"true\", " +
                    "\"message\":" + "\"" + e + "\"}";
        }
    }

    /**
     * Function updates the game which is currently being played.
     * @param  game    the game as a string
     * @return         the updated game as string, which can be sent to all the users and interpreted by the frontend
     */
    public String updateCurrentGame(String game) {
        return this.game.updateGame(game);
    }

    /**
     * @return         the game as string, which can be interpreted by the frontend
     */
    public String getCurrentGame() {
        return this.game != null ? this.game.serializeGame() : "";
    }

    /**
     * Function returns the admin of the room and sets a new one, in case no admin has been chosen or
     * the admin left the room.
     * @return         the current admin as a User @see com.communication.backend.model.User of the room
     */
    public User getAdmin() {
        if ((this.admin == null || !this.users.contains(this.admin)) && this.users.size() > 0) {
            this.admin = this.users.get(0);
        }
        return this.admin;
    }

    /**
     * Function returns a presentation of the room as a string.
     * Contains the id, users and the name of the current game if not null
     * @return         the room in a string representation
     */
    @Override
    public String toString() {
        StringBuilder a = new StringBuilder("Room Id: " + this.roomId + "\n");
        for (User user: this.users) {
            a.append(user.toString()).append("\n");
        }
        if (this.game != null) {
            a.append("Current Game: ").append(this.game.getName());
        } else {
            a.append("Current Game: No game associated with room");
        }
        return a.toString();
    }

    /**
     * Checks if two rooms are the same. This is true, if their ids are the same
     * @return         true, if the rooms are the same
     */
    @Override
    public boolean equals(Object o) {
        if (o == null) {
            return false;
        }

        if (o.getClass() != this.getClass()) {
            return false;
        }

        final Room room = (Room) o;
        return this.roomId.equals(room.getId());
    }
}
