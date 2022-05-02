package com.communication.backend.games;

import com.communication.backend.model.User;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.util.ArrayList;
import java.util.stream.Collectors;

abstract public class Game {
    protected String name;
    protected User currentPlayer;
    protected User[] players;
    protected int maxPlayers;  // in case a room has more people inside, than people that can participate in a game
    protected User winner;

    public Game(String name, ArrayList<User> players, int maxPlayers) {
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.setPlayers(players);
        this.winner = null;
    }

    protected User getPlayer(String id) {
        for (User player: this.players) {
            if (player.getId().equals(id)) {
                return player;
            }
        }
        return null;
    }

/*  TODO error in case not enough players in the room */
    private void setPlayers(ArrayList<User> players) {
        if (players.size() >= this.maxPlayers) {
            this.players = players.stream().limit(maxPlayers).collect(Collectors.toList()).toArray(new User[this.maxPlayers]);
            currentPlayer = this.players[0];
        }
    }

    /* TODO Something wrong with update and check for correct name */
    public String updateGame(String game) {
        JSONObject deserializedGame = this.deserializeGame(game);
        if (this.isValidMove(deserializedGame)) {
            updateGameBoard(deserializedGame);
            return serializeGame();
        }
        return "";
    }

    private JSONObject deserializeGame(String game) {
        JSONParser parser = new JSONParser();

        try {
            return (JSONObject) parser.parse((String) parser.parse(game));
        } catch (ParseException pe) {
            pe.printStackTrace();
        }
        return null;
    }

    public abstract boolean isValidMove(JSONObject game);
    public abstract void updateGameBoard(JSONObject game);
    public abstract String serializeGame();
}

