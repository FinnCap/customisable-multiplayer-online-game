package com.communication.backend.games;

import com.communication.backend.model.User;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import static java.lang.Math.toIntExact;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class TikTakToe extends Game {

    String[] board = new String[]{"", "", "", "", "", "", "", "", ""};

    public TikTakToe(String name, ArrayList<User> players, int maxPlayer) {
        super(name, players, maxPlayer);
        this.setSymbols();
    }

    private void setSymbols() {
        super.players[0].setSymbol("X");
        super.players[1].setSymbol("O");
    }

    @Override
    public boolean isValidMove(JSONObject game) {
        return this.board[toIntExact((long) game.get("field"))].equals("");
    }

    @Override
    public void updateGameBoard(JSONObject game) {
        this.board[toIntExact((long) game.get("field"))] = (String) game.get("player");
    }

    private User nextPlayer() {
        return super.players[(super.currentPlayer.getTurn() + 1) % super.players.length];
    }

    private User gameFinished() {
        int[][] winCombinations = new int[][] {{0, 1, 2}, {3, 4, 5}, {6, 7, 8},
                {0, 3, 6}, {1, 4, 7}, {2, 5, 8},
                {0, 4, 8}, {2, 4, 6}};
        for (int[] comb: winCombinations) {
            if (board[comb[0]].equals("")) {
                return null;
            }

            if (board[comb[0]].equals(board[comb[1]]) &&
                    board[comb[1]].equals(board[comb[2]]) &&
                    board[comb[0]].equals(board[comb[2]])) {
                return super.getPlayer(board[comb[0]]);
            }
        }
        return null;
    }

    @Override
    public String serializeGame() {
        User winner = gameFinished();

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

/*    @Override
    public JSONArray deserializeGame(String game) {
        JSONParser parser = new JSONParser();

        try {
            Object obj = parser.parse(game);
            return (JSONArray) obj;
        } catch (ParseException pe) {
            pe.printStackTrace();
        }

        return null;
    }*/
}
