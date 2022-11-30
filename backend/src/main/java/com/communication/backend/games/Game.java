package com.communication.backend.games;

import com.communication.backend.model.User;

import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Inherit from this class when creating a new Game.
 */
abstract public class Game {

    /** The name of the game, should correspond with the class */
    protected final String name;

    /** The user who's turn it currently is, can be null */
    protected User currentPlayer;

    /** The user which are participating in the current game, as there can be more users in a room than players */
    protected User[] players;

    /** The max number of players for the game */
    protected final int maxPlayers;

    /** The min number of players for the game */
    protected final int minPlayers;

    /**
     *
     * @param  name          The name of the game, should correspond with the class
     * @param  users         All users in the room, the appropriate number of users for the game will be chosen
     *                       automatically from them depending on min and max players
     * @param  minPlayers    the minimum number of players for the game
     * @param  maxPlayers    the maximum number of players for the game
     */
    public Game(String name, ArrayList<User> users, int minPlayers, int maxPlayers) throws NotEnoughPlayerException {
        this.name = name;
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.setPlayers(users);
    }

    /**
     * Returns the player as a user object associated with a id
     * @param  id    The id as a string for the player which should be found
     * @return       The player as a user object if found, otherwise null
     */
    protected User getPlayer(String id) {
        for (User player: this.players) {
            if (player.getId().equals(id)) {
                return player;
            }
        }
        return null;
    }

    /**
     * @return the name of the current game as a string
     */
    public String getName() {
        return this.name;
    }

    /**
     * Selects the players for this game. Limits the number to maxPlayers and returns when users contains less users
     * than minPlayers.
     * @param  users    The users from which the players for the room should be selected.
     */
    private void setPlayers(ArrayList<User> users) throws NotEnoughPlayerException {
        if (users.size() < minPlayers) {
            String a = "Currently are only " + users.size() + "users in the room. Expected: " + minPlayers;
            throw new NotEnoughPlayerException(a);
        }
        this.players = users.stream().limit(maxPlayers).collect(Collectors.toList()).toArray(new User[this.maxPlayers]);
        currentPlayer = this.players[0];
    }

    /**
     * Function gets the new game as a sting, checks if the move was valid, then updates the game board and returns
     * the serialized game as a string to be sent to the other users.
     * All this behavior needs to be implemented in your class which extends from this class
     * @param  game    The game as a string
     * @return         the updated game as a string. If the move wasn't valid an empty string will be returned.
     */
    public String updateGame(String game) {
        if (this.isValidMove(game)) {
            updateGameBoard(game);
            return serializeGame();
        }
        return "";
    }

    /**
     * Function receives a string of your game and returns true, if the move by a player was valid.
     * If not needed just return true
     * @param  game    The game as a string
     * @return         true if the move was valid
     */
    public abstract boolean isValidMove(String game);

    /**
     * Function updates the internal state of your game.
     * @param  game    The game as a string
     */
    public abstract void updateGameBoard(String game);

    /**
     * Function serializes the game so that it can be interpreted by your frontend implementation of the game. This
     * string will be sent to all players
     * @return    The game as a string
     */
    public abstract String serializeGame();
}


