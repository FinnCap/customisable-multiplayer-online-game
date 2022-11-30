import { Game } from '../models/game';
import { Notification } from '../models/notification';
import { User } from '../models/user';
import {
    Injectable,
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    Injector,
    EmbeddedViewRef,
    Type
} from '@angular/core';

declare var require: any

@Injectable({
	providedIn: 'root'
})

export class DataService {

    /** the id of the room this {@link User} is currently in */
    public roomId: string = "";
    

    /** optional error message to be displayed on the board */
    public errorMessage: string = ""

    private _thisUser: User;

    /** Reference to the Game component which is currently active, undefined if no component is active */
    private _currentGame: ComponentRef<any> | undefined;

    /** List of {@link Notification}s for the chat */
    private _notifications: Notification[] = [];

    /** List of {@link User}s, which are in the same room as this user */
    private _users: User[] = []; 

    constructor(
        private _appRef: ApplicationRef,
        private _resolver: ComponentFactoryResolver,
        private _injector: Injector) {
    }

    /**
     * @returns this {@link User}
     */
    get thisUser(): User {
        return this._thisUser;
    }

    /**
     * Creates this {@link User}.
     * @param user this {@link User}
     */
    set thisUser(user: User) {
        this._thisUser = user;
        this._users.push(this._thisUser)
    }

    /**
     * @return the instance of the {@link _currentGame} if defined.
     */
    get currentGame(): Game | undefined {
        if (this._currentGame === undefined) {
            return undefined;
        }
        return this._currentGame.instance;
    }

    /**
     * Function sets or updates the {@link _currentGame}.
     * If a new game is chosen, the game string must include a game_name field,
     * that contains the name of the Game Component Class without Component at the end.
     * 
     * E.g. export class TikTakToeComponent extends Game implements OnInit { ... }
     * {
     *     game_name: "TikTakToe",
     *     ...
     * }
     * 
     * The component folder must be located under src/app/components/games/ and the folder and its
     * file names must be the game_name in dash-case:
     * E.g. game_name: "TikTakToe",
     * tik-tak-toe:
     *     tik-tak-toe.component.html
     *     tik-tak-toe.component.scss
     *     tik-tak-toe.component.ts
     * @param game the string for the game which has been chosen
     */
     public updateGame(game: string) {
        const g = JSON.parse(game)
        if (this._currentGame === undefined || g.game_name !== this._currentGame.instance.name) {
            if (this._currentGame !== undefined) {
                this._removeGameRef();
                this._currentGame = undefined
            }

            if (g.error == "true") {
                this.errorMessage = g.message;
                return
            }

            const componentFolderName = g.game_name.split(/(?=[A-Z])/).join("-").toLowerCase();
            const location = componentFolderName + "/" + componentFolderName
            const dynModule = require('../components/games/' + location + ".component.ts");
            this._setGameRef(dynModule[g.game_name + "Component"]);

            if (this._currentGame !== null) {
                this._currentGame!.instance.updateGameBoard(game)
            }

            this.errorMessage = g.message;
        } else {
            this._currentGame.instance.updateGameBoard(game)
        }
    }

    public get users(): User[] {
        return this._users;
    }
    
    /**
     * Adds a {@link User} to the list of {@link _users}.
     * @param user the {@link User} which should be added to the list of {@link _users}
    */
     public addUser(user: User) {
        let u = this.findUser(user.id)
        if (u == undefined) {
            this._users.push(user);
        }        
    }

    /** 
     * Finds a user by the users id
     * @param userId the id of the user
     * @return the {@link User} if found, else {@link undefined}
     */
    public findUser(userId: string): User | undefined {
        return this._users.find(u => u.id == userId)
    }

    /** 
     * Removes a user from {@link _users} if the user left the room for example.
     * @param user the user to be removed
     */
    public removeUser(user: User) {
        const index = this._users.findIndex(u => u.id === user.id)
        if (index > -1) {
            this._users.splice(index, 1);
        }
    }

    /** 
     * Adds a {@link Notification} to the list {@link _notifications}
     * @param notification the {@link Notification} to be added to the list {@link _notifications}
     */
    public addNotification(notification: Notification) {
        this._notifications.push(notification);
    }
    
    /** @return the list of {@link _notifications} */
    get notifications(): Notification[] {
        return this._notifications;
    }

    /**
     * Function removes a {@link Notification} from the list {@link _notifications}.
     * For example if a user was admitted to enter the room the {@link Notification}should be removed.
     * @param not the {@link Notification} to be removed
     */
    public removeNotification(not: Notification): void {
        this._notifications.forEach((n, index) => {
            if (n.equals(not)) {
                this._notifications.splice(index, 1);
            }
        });
    }

    /**
     * Sends a {@link Notification} to the backend, that the user wanting to join the room is allowed to join the room.
     * @param not the {@link Notification} containing the accept message for a specific user
     */
    public makeNotificationJoin(not: Notification): void {
        const pos = this._notifications.findIndex(n => n.messageId === not.messageId);
        this._notifications.splice(pos, 1);
    }

    /**
     * Sends a {@link Notification} to the backend, that the user wanting to join the room is not allowed to join the room.
     * @param not the {@link Notification} containing the deny message for a specific user
     */
    public makeNotificationDeny(not: Notification): void {
        const pos = this._notifications.findIndex(n => n.messageId === not.messageId);
        this._notifications.splice(pos, 1);
    }

    /**
     * Sets the ComponentRef in currentGame and adds it to the parent div in
     * {@link board.component.html }.
     * @param component the loaded component
     */
    private _setGameRef(component: Type<unknown>): void {
        const componentRef = this._resolver.resolveComponentFactory(component).create(this._injector);
        this._appRef.attachView(componentRef.hostView);

        const element = document.getElementById("currentGame");
        if (element !== null) {
            element.appendChild((componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement);
            this._currentGame = componentRef
        }
    }

    /**
     * Deletes the ComponentRef of the current game and removes it from the parent div in
     * {@link board.component.html }.
     */
    private _removeGameRef(): void {
        if (this._currentGame) {
            this._appRef.detachView(this._currentGame.hostView);
            this._currentGame.destroy();
        }
    }
}