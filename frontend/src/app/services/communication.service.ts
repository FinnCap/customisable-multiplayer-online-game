import { Injectable} from '@angular/core';
import { DataService } from './data.service';
import { Notification, NotificationError, NotificationType } from '../models/notification';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';


declare var SockJS;
declare var Stomp;

@Injectable({
	providedIn: 'root'
})

export class CommunicationService {

	private _stompClient: any;

	constructor(private dataService: DataService, private http: HttpClient) { }

	/**
	 * Connect with the _stompClient and set information
	 * @param username the username of the this user
	 * @param callback the callback function that handles the response of the backend
	 * @param roomId the roomId for the room the user wants to join
	 */
	connect(username: string, callback: (msg: Notification) => void, roomId: string = "") {
		this.dataService.roomId = roomId;
		this.dataService.thisUser = new User(username, "", "", roomId);

		// Change if backend runs at another location
		const socket = new SockJS('http://localhost:8080/ws');
		this._stompClient = Stomp.over(socket);

		var headers = {};
		headers["username"] = this.dataService.thisUser.username;

		const _this = this;
		
		this._stompClient.connect(headers, (frame) => { 
				this.dataService.thisUser.id = /\/([^\/]+)\/websocket\/?$/.exec(socket._transport.url)![1];
				this.onConnected(_this, callback);
			}, 
			console.log);
	}

	/**
	 * Calls the newRoom function or joinRoom function after the frontend is connect to the backend over stomp
	 * @param reference reference to this class which is used to enter the room
	 * @param callback the callback function that handles the response of the backend
	 * @param roomId the roomId for the room the user wants to join
	 */
	onConnected(reference: CommunicationService, callback: (msg: Notification) => void) {
		if (this.dataService.roomId == "") {
			reference.newRoom(callback);
		} else {
			reference.joinRoom(callback);
		}
	}

	/**
	 * Function asks the backend to create a new room and waits for the response.
	 * Afterwards the callback is called and the users subscribes to all messages for the room.
	 * @param callback function that handles the response from the backend
	 */
	newRoom(callback: (msg: Notification) => void) {
		const topic = "/app/game/newRoom"
		this._stompClient.send(topic,
			{},
			new Notification("", this.dataService.thisUser, NotificationType.NEWROOM, this.dataService.roomId).stringify());

		this._stompClient.subscribe('/user/game/newRoomResponse', (msg) => {
			const notification = this.convertToNotification(msg);
			this.dataService.roomId = notification.roomId;
			this.dataService.thisUser.color = notification.user.color
			callback(notification);

			this.subscribeMessages();
		});
	}

	/**
	 * Function asks the backend to ask the admin if this user can join the room and waits for response.
	 * Afterwards the callback is called and if this user is allowed to join the room he subscribes to all messages for the room.
	 * @param callback function that handles the response from the backend
	 */
	joinRoom(callback: (msg: Notification) => void) {

		this._stompClient.send(`/app/game/userAskJoin`,
			{},
			new Notification("", this.dataService.thisUser, NotificationType.ASK, this.dataService.roomId).stringify()
	  	);

		this._stompClient.subscribe('/user/game/joinRoomResponse', (msg) => {
			const notification = this.convertToNotification(msg);
			callback(notification);
			const admitEntry = notification.type.toString() === NotificationType[NotificationType.ADMITENTRY];
			const noError = notification.error.toString() === NotificationError[NotificationError.NONE];
			if (admitEntry && noError) {
				this.dataService.roomId = notification.roomId;
				this.dataService.thisUser.color = notification.user.color;
				const p = JSON.parse(msg.body);
				const users = p.users;
				if (users) {
					users.forEach(user => {
						if (user.id !== this.dataService.thisUser.id) {
							this.dataService.addUser(new User(user.username, user.id, user.color, user.roomId, user.points));
						}
					})
				}

				const game = p.currentGame;
				if (game) {
					// make sure, that the view is loaded where the game should be placed
					setTimeout(() => { this.dataService.updateGame(JSON.stringify(p.currentGame))}, 2000);
				}
				
				this.subscribeMessages();
			}
		});
	}

	/**
	 * @param user the user who was admitted entry
	 */
	acceptEntry(user: User): void {
		this._stompClient.send(`/app/game/${this.dataService.roomId}/addUserRoom`,
			{},
			new Notification("", user, NotificationType.JOIN, this.dataService.roomId).stringify()
	  	);
	}

	/**
	 * @param user the user who was denied entry
	 */
	denyEntry(user: User): void {
		this._stompClient.send(`/app/game/${this.dataService.roomId}/denyUserRoom`,
			{},
			new Notification("", user, NotificationType.DENYENTRY, this.dataService.roomId).stringify()
	  	);
	}

	/**
	 * Notifies the backend, that this user chose a new game.
	 * @param game a json string, that must at least contain a game_name field with the name for the chosen game. 
	 * 			   The value of game_name must be the same as the games class name in the backend!
	 */
	chooseGame(game: string): void {
		this._stompClient.send(`/app/game/${this.dataService.roomId}/chooseGame`,
		{},
		game
	  );
	}

	/**
	 * Function sends the state of the game to the backend after the player made a move for example.
	 * Use this method to update the game for other players.
	 */
	updateGame(): void {
		this._stompClient.send(`/app/game/${this.dataService.roomId}/updateGame`,
			{},
			this.dataService.currentGame?.serializeGame()
		);
	}

	/**
	 * Sends a {@link Notification} to the backend
	 * @param message the message as a string for the notification
	 */
	sendNotification(message: string): void {
		const a = new Notification(message, this.dataService.thisUser, NotificationType.CHAT, this.dataService.roomId).stringify()
		this._stompClient.send(`/app/game/${this.dataService.roomId}/notification`, {}, a);
	}

	/**
	 * Function subscribes to all messages in the room.
	 */
	private subscribeMessages(): void {
		this._stompClient.subscribe(`/game/${this.dataService.roomId}/userJoinedLeft`, (msg) => {
			const n = this.convertToNotification(msg);
			if (n.type.toString() === NotificationType[NotificationType.JOIN]) {
				this.dataService.addUser(new User(n.user.username, n.user.id, n.user.color, n.user.roomId));
				this.dataService.addNotification(n);
			} else if (n.type.toString() === NotificationType[NotificationType.LEAVE]) {
				this.dataService.removeUser(new User(n.user.username, n.user.id, n.user.color, n.user.roomId));
				this.dataService.addNotification(n);
			}
		});

		this._stompClient.subscribe(`/game/${this.dataService.roomId}/gameUpdate`, (msg) => {
			this.dataService.updateGame(msg.body);
		});

		this._stompClient.subscribe(`/game/${this.dataService.roomId}/notification`, (msg) => {
			this.dataService.addNotification(this.convertToNotification(msg));
		});


		this._stompClient.subscribe(`/user/game/${this.dataService.roomId}/userAskJoin`, (msg) => {
			const notification = this.convertToNotification(msg);
			this.dataService.addNotification(notification);
			if (notification.type.toString() === NotificationType[NotificationType.ASK]) {
				setTimeout(()=>{
					if (this.dataService.notifications && this.dataService.notifications.length > 0) {
						const n = this.dataService.notifications.find(noti => noti.messageId === notification.messageId);
						if (n && n.type.toString() === NotificationType[NotificationType.ASK]) {
							this.dataService.makeNotificationDeny(n);
							this.denyEntry(n.user);
						}
					}
				}, 20000);
			}
		});
	}

	/**
	 * Converts a notification which was send over stomp into a {@link Notification} instance
	 * @param notification the notification to be converted
	 * @returns the {@link Notification} instance
	 */
	private convertToNotification(notification): Notification {
		const n = JSON.parse(notification.body);
		const user = new User(n.user.username, n.user.id, n.user.color, n.user.roomId);
		return new Notification(n.message, user, n.type, n.roomId, notification.headers["message-id"], n.error);
	}
}
