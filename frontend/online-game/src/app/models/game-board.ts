import { User } from "./user";

export class GameBoard<T> {
    gameBoard: Array<T>;
    name: string;

    constructor(gameBoard: T[], name: string) {
        this.gameBoard = gameBoard;
        this.name = name;
    }
}