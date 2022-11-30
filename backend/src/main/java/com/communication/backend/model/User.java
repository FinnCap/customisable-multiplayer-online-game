package com.communication.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.security.Principal;
import java.util.Random;

/**
 * This class implements a user of the system
 */
public class User implements Principal {

    /** The name as entered in the frontend */
    @JsonProperty("username") private String username = "";

    /** The name id for the person, is the stomp session id and the user is identified with this */
    @JsonProperty("id") private final String id;

    /** The room id the person is in */
    @JsonProperty("roomId") private String roomId = "";

    /** The number of games the user won */
    @JsonProperty("points") private int points = 0;

    /** The color associated with the user for its icon in the frontend */
    @JsonProperty("color") private String color = ""; // hex color for symbol in chat

    public User(String username, String id) {
        this.username = username;
        this.id = id;
        String[] colorValues = new String[]{"#FFBF00", "#FF7F50", "#DE3163", "#9FE2BF", "#40E0D0", "#6495ED", "#CCCCFF",
        "#1ABC9C", "#34495E", "#8E44AD"};
        this.color = colorValues[new Random().nextInt(10)];
    }

    /**
     * @return the id of this user as a string
     */
    public String getId() {
        return this.id;
    }

    /**
     * @return the id of the room this user is in as a string
     */
    public String getRoomId() {
        return this.roomId;
    }

    /**
     * @param roomId the id of the room this user is in as a string
     */
    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    /**
     * @return the number of points for this user
     */
    public int getPoints() {
        return this.points;
    }

    /**
     * sets the number of points for this user
     * @param points the updated number of points
     */
    public void setPoints(int points) {
        this.points = points;
    }

    /**
     * converts this user into a string representation with all its properties
     * @return the user in a string representation
     */
    @Override
    public String toString() {
        String s = "User:\n";
        s += "  username: " + this.username + "\n";
        s += "  roomId: " + this.roomId + "\n";
        s += "  id: " + this.id + "\n";
        s += "  points: " + this.points + "\n";
        s += "  color: " + this.color;
        return s;
    }

    /**
     * @return the username of this user as a string
     */
    @Override
    public String getName() {
        return this.username;
    }

    /**
     * Compares two users, if the ids are the same, the users are considered to the equal
     * @return true if user ids are the same, else false
     */
    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }

        if (obj.getClass() != this.getClass()) {
            return false;
        }

        final User user = (User) obj;
        return this.id.equals(user.getId());
    }

    /**
     * Function sets a random color for this user if this has not been done before.
     */
    public void setColor() {
        if (this.color.equals("")) {
            String[] colorValues = new String[]{"#FFBF00", "#FF7F50", "#DE3163", "#9FE2BF", "#40E0D0", "#6495ED",
                    "#CCCCFF", "#1ABC9C", "#34495E", "#8E44AD"};
            this.color = colorValues[new Random().nextInt(10)];
        }
    }
}
