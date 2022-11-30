package com.communication.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Notification for all communication between users and users and the backend, except for game updates.
 */
public class Notification {

    /** the content of this notification */
    @JsonProperty("message") public String message;

    /** the user associated with this notification, usually the one that send it in the frontend */
    @JsonProperty("user") public User user;

    /** type of this notification, for example chat @see NotificationType */
    @JsonProperty("type") public NotificationType type;

    /** error value, for example if a room does not exist @see NotificationError */
    @JsonProperty("error") public NotificationError error;

    /** The room id of the room this notification came from / is designated to */
    @JsonProperty("roomId") public String roomId;

    /**
     *
     * @param  message    the content of this notification
     * @param  user       the user associated with this notification, usually the one that send it in the frontend
     * @param  type       type of this notification, for example chat @see NotificationType
     */
    public Notification(String message, User user, NotificationType type) {
        this.message = message;
        this.user = user;
        this.type = type;
    }

    public enum NotificationType {
        NEWROOM, // the user wants to create a new room
        JOIN, // the user associated with this notification joins the room
        LEAVE, // the user associated with this notification leaves the room
        ASK, // the user associated with this notification asks the admin to join the room
        ADMITENTRY, // the user associated with this notification is admitted entry
        DENYENTRY, // the user associated with this notification is denied entry
        CHAT // the user associated with this notification sent a message to the chat
    }

    public enum NotificationError {
        NONE, // no error with this notification
        NOTEXIST // the room the user, associated with this notification, want's to join does not exist
    }

    /**
     * @return string notification of the message containing all the properties of the class
     */
    @Override
    public String toString() {
        String a = "Message: " + this.message + "\n";
        a += this.user.toString() + "\n";
        a += "Notification Type: " + this.type + "\n";
        a += "Notification Error: " + this.error + "\n";
        a += "Room Id: " + this.roomId + "\n";
        return a;
    }
}


