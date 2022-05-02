package com.communication.backend.model;

public class RoomMessage {
    private RoomMessage.RoomType type;
    private RoomMessage.RoomError error;
    private User user;
    private String roomId;

    public RoomMessage(RoomMessage.RoomType type, User user, RoomMessage.RoomError error) {
        this.type = type;
        this.user = user;
        this.error = error;
    }

    public enum RoomType {
        NEWROOM,
        JOIN,
        WAIT,
        LEAVE
    }

    public enum RoomError {
        NONE,
        NOTEXIST,
        NOTPERMITTED,
        FULL
    }

    public RoomMessage.RoomType getType() {
        return type;
    }

    public void setType(RoomMessage.RoomType type) {
        this.type = type;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRoomId() {
        return this.roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public void setError(RoomMessage.RoomError error) {
        this.error = error;
    }

    public RoomMessage.RoomError getError() {
        return this.error;
    }
}
