package com.communication.backend.model;

import com.communication.backend.games.Game;
import com.communication.backend.games.TikTakToe;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.util.ArrayList;
import java.util.Objects;

public class Room {
    private String roomId = "";
    private ArrayList<User> users = new ArrayList<>();
    private ArrayList<User> waitingRoom = new ArrayList<>();
    private final int maxUser;
    private Game game;

    public Room(String roomId, int maxUser) {
        this.roomId = roomId;
        this.maxUser = maxUser;
    }

    public String getId() {
        return this.roomId;
    }

    // Functions for users which are in the room

    public boolean addUserToRoom(User user) {
        if (this.users.size() >= this.maxUser || !Objects.equals(user.getRoomId(), this.roomId)) {
            return false;
        } else {
            this.users.add(user);
            return true;
        }
    }

    public boolean removeUserRoom(User user) {
        return this.users.remove(user);
    }

    public boolean hasUserRoom(User user) {
        return this.users.contains(user);
    }

    // Functions for users in the waiting room

    public void addUserWaitingRoom(String username) {
        this.waitingRoom.add(new User(username, ""));
    }

    public void removeUserWaitingRoom(User user) {
        this.waitingRoom.remove(user);
    }

    public boolean hasUserWaitingRoom(User user) {
        return this.waitingRoom.contains(user);
    }


    public boolean hasId(String id) {
        return this.roomId.equals(id);
    }

    public String toString() {
        StringBuilder a = new StringBuilder("Room Id: " + this.roomId + "\n");
        for (User user: this.users) {
            a.append(user.toString()).append("\n");
        }
        return a.toString();
    }

    public int numberUser() {
        return this.users.size();
    }

    public String setCurrentGame(String game) {
        JSONParser parser = new JSONParser();

        try {
            JSONObject o = (JSONObject) parser.parse((String) parser.parse(game));

            if (o.get("name").equals("TikTakToe")) {
                this.game = new TikTakToe("TikTakToe", this.users, 2);
                return this.game.updateGame(game);
            }
        } catch (ParseException pe) {
            pe.printStackTrace();
        }

        return "";
    }

    public String updateCurrentGame(String game) {
        return this.game.updateGame(game);
    }
}
