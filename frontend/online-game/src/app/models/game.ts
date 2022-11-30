import { CommunicationService } from 'src/app/services/communication.service';
import { DataService } from 'src/app/services/data.service';
import { Notification, NotificationType } from './notification';

/**
 * Every new Game should extend this class, so that game updates and so on work correctly
 */
export abstract class Game {

    /** The name of the Game, should be the same as the name of the corresponding component without Component */
    name: string;

    /** The ids of the {@link User}s that participate in the game */
    players: string[];

    /**
     * The id of the {@link User} that won the game. If {@link actWinner()} is called, the function
     * will compare if the variable contains an id or not.
    */
    winner: string = "";
    
    constructor(name: string, protected dataService: DataService, protected communicationService: CommunicationService) {
        this.name = name
    }

    /**
     * Function will notify everyone in the room by a chat message, that the player that has the id saved in {@link winner} won the game.
     * And adds one point
     */
    actWinner() {
        if (this.winner !== "") {
            let user = this.dataService.findUser(this.winner);
            if (user !== undefined) {
                user.points += 1
                this.dataService.addNotification(new Notification(user.username + " won the game!",
                                                                   user,
                                                                   NotificationType.WINNER))
            }
        }
    }

    /**
     * Function updates the internal state of your game.
     * @param  game    The game as a string
     */
    public abstract updateGameBoard(game: string): void

    /**
     * Function serializes the game so that it can be interpreted by your backend implementation of the game.
     */
    public abstract serializeGame(): string

}