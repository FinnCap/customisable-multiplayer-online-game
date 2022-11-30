import { Component, OnInit } from '@angular/core';
import { CommunicationService } from 'src/app/services/communication.service';
import { DataService } from 'src/app/services/data.service';

@Component({
	selector: 'app-choose-game',
	templateUrl: './choose-game.component.html',
	styleUrls: ['./choose-game.component.scss']
})

export class ChooseGameComponent implements OnInit {

	availableGames: {displayName: string, internalName: string}[] = [
		{
			displayName: "TikTakToe",
			internalName: "TikTakToe",
		},
		/* Add your game
		{
			displayName: The name as displayed in the Choose a Game window
			internalName: The internal name to find the correct class in front an backend.
						  Must be CamelCase and corresponding with the folder name TikTakToe -> tik-tak-toe
						  and the files in the folder tik-tak-toe.component.ts... and the component name must be TikTakToeComponent
						  Also the backend implementation of the game must have the same class name in CamelCase TikTakToe
		},
		 */ 
	];

	private currentGame: string = "";

	constructor(private communicationService: CommunicationService, private dataService: DataService) {}

	ngOnInit(): void {
	}

	chooseGame(game: string) {
		var s = {
			game_name: game,
		}
		this.communicationService.chooseGame(JSON.stringify(s));
		this.currentGame = game
	}

	isActive(game: string): boolean {
		// if (this.dataService.currentGame === undefined) {
		// 	return false;
		// }
		return game === this.currentGame;
	}

}
