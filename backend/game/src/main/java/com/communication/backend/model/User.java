package com.communication.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.security.Principal;

public class User implements Principal {
    private String username = "";
    private String roomId = "";
    private int turn = -1;
    private String id = "";
    private int points = 0;
    private String symbol = ""; // the symbol the player has in the game. E.g. TikTakToe X or O


    public User(@JsonProperty("username") String username) {
        this.username = username;
    }

    public User(String username, String roomId, int turn, String id) {
        this.username = username;
        this.roomId = roomId;
        this.turn = turn;
        this.id = id;
    }

    public User(String username, String roomId) {
        this.username = username;
        this.roomId = roomId;
    }

    @Override
    public String getName() {
        return this.username;
    }

    public String getId() {
        return this.id;
    }

    public String getRoomId() {
        return this.roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    @Override
    public String toString() {
        return "Username: " + this.username + "; roomId: " + this.roomId;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }

        if (obj.getClass() != this.getClass()) {
            return false;
        }

        final User user = (User) obj;
        return this.username.equals(user.getName());
    }

    public int getTurn() {
        return this.turn;
    }

    public void setSymbol(String s) {
        this.symbol = s;
    }

    public String getSymbol() {
        return this.symbol;
    }
}
