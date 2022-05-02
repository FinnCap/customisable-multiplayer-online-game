import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunicationService } from 'src/app/services/communication.service';
import { Notification, NotificationType } from 'src/app/models/notification';
import { DataService } from 'src/app/services/data.service';
import { GameBoard } from 'src/app/models/game-board';

@Component({
	selector: 'app-board',
	templateUrl: './board.component.html',
	styleUrls: ['./board.component.scss']
})

export class BoardComponent implements OnInit {


	notifications: Notification[] = [];

	constructor(private communicationService: CommunicationService, private dataService: DataService) {

	}

	ngOnInit(): void {

	}

	newGame() {
		// this.registerService.newGame();
	}

	makeMove(idx: number) {
		// this.registerService.makeMove(idx, this.roomId).then((result) => {
		// 	console.log(result);
		// }).catch((error) => {
		// 	console.log(error);
		// });

	}

	getRoomId(): string {
		return this.dataService.roomId;
	}

	get currentGameName() {
		if (this.dataService.currentGame) {
			return this.dataService.currentGame;
		}
	}

	acceptEntry(notification: Notification) {
		this.dataService.removeNotification(notification);
		// this.communicationService.acceptEntry(new User()notification.username)
	}

	denyEntry(notification: Notification) {
		this.dataService.removeNotification(notification);
		// this.communicationService.denyEntry(notification.username)
	}
}
