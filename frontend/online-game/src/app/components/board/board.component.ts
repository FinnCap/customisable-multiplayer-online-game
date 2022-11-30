import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
	selector: 'app-board',
	templateUrl: './board.component.html',
	styleUrls: ['./board.component.scss']
})

/**
 * This class represents the Board on which is the are for your game
 */
export class BoardComponent implements OnInit {

	constructor(private dataService: DataService) {

	}

	ngOnInit(): void {

	}

	getRoomId(): string {
		return this.dataService.roomId;
	}

	/**
	 * For the HTML to check if the initial content should be displayed, that no game is currently chosen.
	 * @return the name of the current game if any, otherwise an empty string
	 */
	get currentGameName(): string | undefined {
		if (this.dataService.currentGame !== undefined) {
			return this.dataService.currentGame?.name;
		}
		return ""
	}

	/**
	 * For the HTML.
	 * @return an error message if for example not enough players are there to play the game.
	 */
	get errorMessage(): string {
		return this.dataService.errorMessage;
	}
}
