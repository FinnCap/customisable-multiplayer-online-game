package com.communication.backend.games;

public class NotEnoughPlayerException extends Exception {
    public NotEnoughPlayerException(String errorMessage) {
        super(errorMessage);
    }
}
