package com.communication.backend.games;

import com.communication.backend.model.User;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import static java.lang.Math.toIntExact;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 * Implementation of the game tik tak toe, which extends the class game. All the logical is handled here in the backend.
 * The string for the game looks as follows:
 * {
 *   "name": "TikTakToe",
 *   "player": player id who made the move,
 *   "field": the field the player placed his symbol,
 * }
 */
public class TikTakToe extends Game {

    /** Representation of the tik tak toe board, a field will contain the id of a user */
    private final String[] board = new String[]{"", "", "", "", "", "", "", "", ""};

    /** the players who's turn it currently is */
    private User currentPlayer;

    public TikTakToe(ArrayList<User> possiblePlayers) throws NotEnoughPlayerException {
        super("TikTakToe", possiblePlayers, 2, 2);
        if (super.players.length == 2) {
            int player = (new Random()).nextInt(2);
            this.currentPlayer = super.players[player];
        } else {
            System.out.println("not enough players");
        }
    }

    /**
     * Takes a string representation from a move of a player and checks, if the move is valid.
     * @param  game    The game as a string
     * @return         true if the move was valid
     */
    @Override
    public boolean isValidMove(String game) {
        // when the game is initialized it won't contain a field.
        JSONObject deserializedGame = this.deserializeGame(game);
        if (deserializedGame == null || deserializedGame.get("field") == null) {
            return true;
        }
        int field = toIntExact((long) deserializedGame.get("field"));
        if (field >= 0 && field <= 8) {
            return this.board[field].equals("");
        }
        return false;
    }

    /**
     * Function updates the internal state of the game
     * @param  game    The game as a string
     */
    @Override
    public void updateGameBoard(String game) {
        // when the game is initialized it won't contain a field.
        JSONObject deserializedGame = this.deserializeGame(game);
        if (deserializedGame == null || deserializedGame.get("field") == null) {
            return;
        }
        int field = toIntExact((long) deserializedGame.get("field"));
        if (field >= 0 && field <= 8) {
            this.board[toIntExact((long) deserializedGame.get("field"))] = (String) deserializedGame.get("player");
        }
    }

    /**
     * @return the next player/user
     */
    private User nextPlayer() {
        this.currentPlayer = this.players[0].equals(this.currentPlayer) ? this.players[1] : this.players[0];
        return this.currentPlayer;
    }

    /**
     * @return the user/player if someone won, otherwise null
     */
    private User gameFinished() {
        int[][] winCombinations = new int[][] {{0, 1, 2}, {3, 4, 5}, {6, 7, 8},
                {0, 3, 6}, {1, 4, 7}, {2, 5, 8},
                {0, 4, 8}, {2, 4, 6}};
        for (int[] comb: winCombinations) {
            if (this.board[comb[0]].equals("")) {
                continue;
            }
            if (this.board[comb[0]].equals(this.board[comb[1]]) &&
                    this.board[comb[1]].equals(this.board[comb[2]]) &&
                    this.board[comb[0]].equals(this.board[comb[2]])) {

                User user = super.getPlayer(this.board[comb[0]]);
                user.setPoints(user.getPoints() + 1);
                return user;
            }
        }
        return null;
    }

    /**
     * @return string representation of the game which can be interpreted by the frontend
     */
    @Override
    public String serializeGame() {
        User winner = this.gameFinished();
        Map<String,String> jsonMap = new HashMap<>();

        jsonMap.put("game_name", "TikTakToe");
        jsonMap.put("board", Arrays.toString(board));
        jsonMap.put("next_player", this.nextPlayer().getId());
        jsonMap.put("winner", winner == null ? "" : winner.getId());
        jsonMap.put("player_x", super.players[0].getId());
        jsonMap.put("player_o", super.players[1].getId());

        JSONObject obj = new JSONObject(jsonMap);

        StringWriter out = new StringWriter();

        try {
            obj.writeJSONString(out);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return out.toString();
    }

    private JSONObject deserializeGame(String game) {
        JSONParser parser = new JSONParser();

        try {
            return (JSONObject) parser.parse(game);
        } catch (ParseException pe) {
            pe.printStackTrace();
        }
        return null;
    }
}
