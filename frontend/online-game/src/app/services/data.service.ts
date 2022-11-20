import { Injectable } from '@angular/core';
import { TikTakToeComponent } from '../components/tik-tak-toe/tik-tak-toe.component';
import { Game } from '../models/game';
import { Notification} from '../models/notification';
import { User } from '../models/user';

@Injectable({
	providedIn: 'root'
})

export class DataService {
    private _thisUser: User;
    private _roomId: string = "";
    private _currentGame: Game;
    private _notifications: Notification[] = [];
    private _users: User[] = []; 

    constructor() {
        // this._users.push(new User("Peter", "1", "#FFBF00", "", 7))
        // this._users.push(new User("Herbert", "2", "#FF7F50", "", 5))
        // this._users.push(new User("Anna", "3", "#DE3163", "", 1))
        // this._users.push(new User("Eszter", "4", "#9FE2BF", "", 4))
        // this._users.push(new User("Kika", "5", "#40E0D0", "", 7))
        // this._users.push(new User("Paulo", "6", "#6495ED", "", 3))
        // this._users.push(new User("Andre", "7", "#CCCCFF", "", 9))
        // this._users.push(new User("Jan", "8", "#1ABC9C", "", 10))
        // this._users.push(new User("Lars", "9", "#34495E", "", 8))
        // this._users.push(new User("Sören", "10", "#8E44AD", "", 39))
    }

    /**
     * Returns the own user.
     * @returns {User}
     */
    get thisUser(): User {
        return this._thisUser;
    }

    /**
     * Creates the own User.
     * @param {string} username username
     */
    set thisUser(user: User) {
        this._thisUser = user;
        this._users.push(this._thisUser)
    }

    /**
     * Returns the current room id.
     * @returns {string}
     */
    get roomId(): string {
        return this._roomId;
    }

    /**
     * Sets the current room id.
     * @param {string} roomId
     */
    set roomId(roomId: string) {
        this._roomId = roomId;
    }

    /**
     * Returns a list of the current users
     * @return {User[]}
    */
    get users(): User[] {
        return this._users;
    }

    /**
     * Returns the name of the current game.
     * @return {Game}
     */
     public getCurrentGame(): Game {
        return this._currentGame;
    }

    /**
     * Sets the name of the current game.
     * @param {Game} currentGame
     */
     public updateGame(game: string) {
        const g = JSON.parse(game)
        if (this._currentGame == null) {
            if (g.game_name == "TikTakToe") {
                var ga = new TikTakToeComponent()
                ga.currentPlayer = g.next_player
                ga.mySymbol = (g.player_o == this._thisUser.id) ? "O" : "X"
                ga.winner = ""
                this._currentGame = ga
            }
        } else {
            if (this._currentGame instanceof TikTakToeComponent) {
                this._currentGame.currentPlayer = g.next_player
                this._currentGame.board = g.board.replace(/\s/g, '').slice(1, -1).split(",")
                this._currentGame.winner = g.winner
            }
        }
    }

    public updateGameObject(game: Game) {
        if (game instanceof TikTakToeComponent && this._currentGame instanceof TikTakToeComponent) {
            game.currentPlayer = this._currentGame.currentPlayer
            game.mySymbol = this._currentGame.mySymbol
            game.winner = ""
            this._currentGame = game
        }
    }

    /**
     * Creates a new User from the username and add it to the list of users.
     * @param {username} username
    */
     public addUser(user: User) {
        let u = this.findUser(user)
        if (u == undefined) {
            this._users.push(user);
        }        
    }

    public findUser(user: User): User | undefined {
        return this._users.find(u => u.id == user.id)
    }

    public removeUser(user: User) {
        const index = this.users.indexOf(user, 0);
        if (index > -1) {
            this.users.splice(index, 1);
        }
    }

    public addNotification(notification: Notification) {
        this._notifications.push(notification);
    }

    get notifications(): Notification[] {
        return this._notifications;
    }

    public getNotificationAt(index: number): Notification | null {
        if (index >= 0 && this._notifications.length < index) {
            return this._notifications[index];
        } else {
            return null;
        }

    }

    public removeNotification(not: Notification): void {
        this._notifications.forEach((n, index) => {
            if (n.message === not.message && n.user.id === not.user.id && n.type === not.type) {
                this._notifications.splice(index, 1);
            }
        });
    }

    public makeNotificationJoin(not: Notification): void {
        const pos = this._notifications.findIndex(n => n.messageId === not.messageId);
        this._notifications.splice(pos, 1);
    }

    public makeNotificationDeny(not: Notification): void {
        const pos = this._notifications.findIndex(n => n.messageId === not.messageId);
        this._notifications.splice(pos, 1);
    }
}