import { Injectable } from '@angular/core';
import { GameBoard } from '../models/game-board';
import { Notification, NotificationType } from '../models/notification';
import { User } from '../models/user';

@Injectable({
	providedIn: 'root'
})

export class DataService {
    private _thisUser: User;
    private _roomId: string = "";
    private _currentGame;
    currentGameName = "";
    private _notifications: Notification[] = [];
    private _users: User[] = []; 

    constructor() {
        // this.addNotification(new Notification("Wants To Join", "Peter", NotificationType.ASK))
        // this.addNotification(new Notification("Joined!", "Herbet", NotificationType.JOIN))
        // this.addNotification(new Notification("Left!", "Otto", NotificationType.LEAVE))
        // this.addNotification(new Notification("Joined!", "Jürgen", NotificationType.JOIN))
        // this.addNotification(new Notification("Wants To Join", "Werner", NotificationType.ASK))
        // this.addNotification(new Notification("Left!", "Karl", NotificationType.LEAVE))

        // this.addUser("Peter");
        // this.addUser("Hans");
        // this.addUser("Herbert");
        // this.addUser("Maier");
        // this.addUser("Günther");
        // this.addUser("Otto");
        // this._users[2].addPoint();
        // this._users[2].addPoint();
        // this._users[1].addPoint();
        // this._users[4].addPoint();
        // this._users[3].addPoint();
        // this._users[0].addPoint();

        // this.thisUser = new User("Peter")
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
     * Returns the name of the current game.
     * @return {string}
     */
    get currentGame() {
        return this._currentGame;
    }

    /**
     * Sets the name of the current game.
     * @param {string} currentGame
     */
    set currentGame(currentGame) {
        this._currentGame = currentGame;
    }

    /**
     * Returns a list of the current users
     * @return {User[]}
    */
    get users(): User[] {
        return this._users;
    }

    /**
     * Creates a new User from the username and add it to the list of users.
     * @param {username} username
    */
    addUser(username: string): void {
        this._users.push(new User(username));
    }

    public addNotification(n: Notification) {
        this._notifications.push(n);
        setTimeout(()=>{
            if (this._notifications && this._notifications.length > 0) {
                const pos = this._notifications.findIndex(noti => noti === n);
                this._notifications.splice(pos, 1);
            }
        }, n.type == NotificationType.ASK ? 30000 : 5000);
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

    public removeNotification(not: Notification) {
        this._notifications.forEach((n, index) => {
            if (n.message === not.message && n.username === not.username && n.type === not.type) {
                this._notifications.splice(index, 1);
            }
        });
    }
}