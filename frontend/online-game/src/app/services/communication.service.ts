import { Injectable } from '@angular/core';
import { BoardComponent } from '../components/board/board.component';
import { StartScreenComponent } from '../components/start-screen/start-screen.component';
import { RoomError, RoomMessage, RoomType } from '../models/room-message';
import { Subject } from 'rxjs';
import { DataService } from './data.service';
import { Notification, NotificationType } from '../models/notification';
import { HttpClient } from '@angular/common/http';
import { GameBoard } from '../models/game-board';
import { User } from '../models/user';
import { CompileShallowModuleMetadata } from '@angular/compiler';
import { TikTakToeComponent } from '../components/tik-tak-toe/tik-tak-toe.component';


declare var SockJS;
declare var Stomp;

@Injectable({
	providedIn: 'root'
})

export class CommunicationService {

	public stompClient;
	currentSubscriptions = [];

	connection;

	private componentMethodCallSource = new Subject<any>();
	componentMethodCalled$ = this.componentMethodCallSource.asObservable();

	// userJoinedLeftFun: (notificationString: string) => void;


	constructor(private dataService: DataService, private http: HttpClient) { }

	/**
	 * Connect with the stompclient and set information
	 * @param username 
	 * @param callback
	 * @param roomId 
	 */
	connect(username: string, callback: (msg: RoomMessage) => void, roomId: string = "") {
		this.dataService.roomId = roomId;
		this.dataService.thisUser = new User(username);

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

	onConnected(reference: CommunicationService, callback: (msg: RoomMessage) => void) {
		if (this.dataService.roomId == "") {
			reference.newRoom(callback);
		} else {
			reference.joinRoom(callback);
		}

		this.stompClient
	}

	onError(error) {
		console.log(error)
	}

	newRoom(callback: (msg: RoomMessage) => void) {
		const topic = "/app/game/newRoom"
		this.stompClient.send(topic, {}, JSON.stringify(new RoomMessage(RoomType.NEWROOM, this.dataService.thisUser), ["type", "user", "username", "error"]));

		this.stompClient.subscribe('/users/game/newRoomResponse', (msg) => {
			const message = JSON.parse(msg.body);
			this.dataService.roomId = message.roomId;
			callback(message);

			// this.stompClient.subscribe(`/game/${this.roomId}/userJoinedLeft`, (msg) => {
			// 	const message = JSON.parse(msg.body);
			// 	if (message.type.toString() === RoomType[RoomType.JOIN]) {
			// 		this.userJoinedLeftFun(message.user + " Joined!");
			// 	} else if (message.type.toString() === RoomType[RoomType.LEAVE]) {
			// 		this.userJoinedLeftFun(message.user + " Left!");
			// 	}	
			// });

			this.stompClient.subscribe(`/game/${this.dataService.roomId}/userAskJoin`, (msg) => {
				const message = JSON.parse(msg.body);
				this.dataService.addNotification(new Notification(`Wants To Join`, message.user, NotificationType.ASK));
				console.log(message);
			});

			this.stompClient.subscribe(`/game/${this.dataService.roomId}/gameUpdate`, (msg) => {
				const message = JSON.parse(msg.body);
				console.log(message);
			});
		});
	}

	joinRoom(callback: (msg: RoomMessage) => void) {
		// this.topic = `/app/game/${this.roomId}`;

		this.stompClient.send(`/app/game/${this.dataService.roomId}/addUserWaitingRoom`,
			{},
			JSON.stringify(new RoomMessage(RoomType.JOIN, this.dataService.thisUser, this.dataService.roomId))
	  	);

		this.stompClient.subscribe('/users/game/joinRoomResponse', (msg) => {
			const message = JSON.parse(msg.body);
			this.dataService.roomId = message.roomId;
			callback(message);
			if (message.error.toString() === RoomError[RoomError.NONE]) {
				this.stompClient.subscribe(`/game/${this.dataService.roomId}/userJoinedLeft`, (msg) => {
					const message = JSON.parse(msg.body);
					if (message.type.toString() === RoomType[RoomType.JOIN]) {
						this.dataService.addNotification(new Notification(` Joined!`, msg.user, NotificationType.JOIN));
						// this.userJoinedLeftFun(message.user + " Joined!");
					} else if (message.type.toString() === RoomType[RoomType.LEAVE]) {
						this.dataService.addNotification(new Notification(` Left!`, msg.user, NotificationType.LEAVE));
						// this.userJoinedLeftFun(message.user + " Left!");
					}	
				});
			}
		});
		
		console.log(1);
		this.stompClient.subscribe(`/game/${this.dataService.roomId}/gameUpdate`, (msg) => {
			const message = JSON.parse(msg.body);
			console.log(this.dataService.currentGame.mySymbol);
		});
	}

	acceptEntry(user: User) {
		this.stompClient.send(`/app/game/${this.dataService.roomId}/addUserRoom`,
			{},
			JSON.stringify(new RoomMessage(RoomType.JOIN, user, this.dataService.roomId))
	  	);
	}

	denyEntry(user: User) {
		this.stompClient.send(`/app/game/${this.dataService.roomId}/denyUserRoom`,
			{},
			JSON.stringify(new RoomMessage(RoomType.LEAVE, user, this.dataService.roomId))
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
		game
	  );
	}

	// userJoinedLeft(fn: (notificationString: string) => void) {
	// 	this.userJoinedLeftFun = fn;
	// }
}
