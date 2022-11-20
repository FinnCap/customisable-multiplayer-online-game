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

	public stompClient;
	currentSubscriptions = [];

	connection;

	constructor(private dataService: DataService, private http: HttpClient) { }

	/**
	 * Connect with the stompclient and set information
	 * @param username 
	 * @param callback
	 * @param roomId 
	 */
	connect(username: string, callback: (msg: Notification) => void, roomId: string = "") {
		this.dataService.roomId = roomId;
		this.dataService.thisUser = new User(username, "", "", roomId);

		const socket = new SockJS('http://localhost:8080/ws');
		this.stompClient = Stomp.over(socket);

		var headers = {};
		headers["username"] = this.dataService.thisUser.username;

		const _this = this;
		this.connection = this.stompClient.connect(headers, (frame) => { 
				this.dataService.thisUser.id = /\/([^\/]+)\/websocket\/?$/.exec(socket._transport.url)![1];
				this.onConnected(_this, callback) 
			}, 
			this.onError);
	}

	onConnected(reference: CommunicationService, callback: (msg: Notification) => void) {
		if (this.dataService.roomId == "") {
			reference.newRoom(callback);
		} else {
			reference.joinRoom(callback);
		}
	}

	onError(error) {
		console.log(error)
	}

	newRoom(callback: (msg: Notification) => void) {
		const topic = "/app/game/newRoom"
		this.stompClient.send(topic,
			{},
			new Notification("", this.dataService.thisUser, NotificationType.NEWROOM, this.dataService.roomId).stringify());

		this.stompClient.subscribe('/users/game/newRoomResponse', (msg) => {
			const notification = this.convertToNotification(msg);
			this.dataService.roomId = notification.roomId;
			this.dataService.thisUser.color = notification.user.color
			callback(notification);

			this.stompClient.subscribe(`/game/${this.dataService.roomId}/userAskJoin`, (msg) => {
				const notification = this.convertToNotification(msg);
				this.dataService.addNotification(notification);

				if (notification.type.toString() === NotificationType[NotificationType.ASK]) {
					setTimeout(()=>{
						if (this.dataService.notifications && this.dataService.notifications.length > 0) {
							const n = this.dataService.notifications.find(noti => noti.messageId === notification.messageId);
							if (n && n.type.toString() === NotificationType[NotificationType.ASK]) {
								this.dataService.makeNotificationDeny(n);
								this.denyEntry(n.user)
							}
						}
					}, 20000);
				}
			});
			this.subscribeMessages();
		});
	}

	joinRoom(callback: (msg: Notification) => void) {

		this.stompClient.send(`/app/game/${this.dataService.roomId}/addUserWaitingRoom`,
			{},
			new Notification("", this.dataService.thisUser, NotificationType.ASK, this.dataService.roomId).stringify()
	  	);

		this.stompClient.subscribe('/users/game/joinRoomResponse', (msg) => {
			const notification = this.convertToNotification(msg);
			callback(notification);
			if (notification.error.toString() === NotificationError[NotificationError.NONE]) {
				this.dataService.roomId = notification.roomId;
				this.dataService.thisUser.color = notification.user.color;
				
				JSON.parse(msg.body).users.forEach(user => {
					this.dataService.addUser(new User(user.username, user.id, user.color, user.roomId, user.points))
				})

				this.subscribeMessages();
			}
		});
	}

	acceptEntry(user: User) {
		this.stompClient.send(`/app/game/${this.dataService.roomId}/addUserRoom`,
			{},
			new Notification("", user, NotificationType.JOIN, this.dataService.roomId).stringify()
	  	);
	}

	denyEntry(user: User) {
		this.stompClient.send(`/app/game/${this.dataService.roomId}/denyUserRoom`,
			{},
			new Notification("", user, NotificationType.DENYENTRY, this.dataService.roomId).stringify()
	  	);
	}

	chooseGame(game: string) {
		this.stompClient.send(`/app/game/${this.dataService.roomId}/chooseGame`,
		{},
		JSON.stringify(game)
	  );
	}

	updateGame(game: string) {
		this.stompClient.send(`/app/game/${this.dataService.roomId}/updateGame`,
		{},
		JSON.stringify(game)
	  );
	}

	sendNotification(message: string) {
		const a = new Notification(message, this.dataService.thisUser, NotificationType.CHAT).stringify()
		console.log(a)
		this.stompClient.send(`/app/game/${this.dataService.roomId}/notification`, {}, a);
	}

	private subscribeMessages(): void {
		this.stompClient.subscribe(`/game/${this.dataService.roomId}/userJoinedLeft`, (msg) => {
			const n = this.convertToNotification(msg);
			if (n.type.toString() === NotificationType[NotificationType.JOIN]) {
				this.dataService.addUser(new User(n.user.username, n.user.id, n.user.color, n.user.roomId))
				this.dataService.addNotification(n);
			} else if (n.type.toString() === NotificationType[NotificationType.LEAVE]) {
				this.dataService.removeUser(new User(n.user.username, n.user.id, n.user.color, n.user.roomId))
				this.dataService.addNotification(n);
			}
		});

		this.stompClient.subscribe(`/game/${this.dataService.roomId}/gameUpdate`, (msg) => {
			this.dataService.updateGame(msg.body);
		});

		this.stompClient.subscribe(`/game/${this.dataService.roomId}/notification`, (msg) => {
			this.dataService.addNotification(this.convertToNotification(msg));
		});
	}

	private convertToNotification(notification): Notification {
		const n = JSON.parse(notification.body);
		console.log(n)
		console.log(n.user.color)
		const user = new User(n.user.username, n.user.id, n.user.color, n.user.roomId)
		return new Notification(n.message, user, n.type, n.roomId, notification.headers["message-id"], n.error)
	}
}
