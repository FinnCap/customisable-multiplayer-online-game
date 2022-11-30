import { Component, OnInit } from '@angular/core';
import { Game } from 'src/app/models/game';
import { CommunicationService } from 'src/app/services/communication.service';
import { DataService } from 'src/app/services/data.service';


@Component({
	selector: 'app-tik-tak-toe',
	templateUrl: './tik-tak-toe.component.html',
	styleUrls: ['./tik-tak-toe.component.scss']
})

/** This class implements the frontend functionality of the game */

export class TikTakToeComponent extends Game implements OnInit {

	/** Representation of the tik tak toe board, a field will contain the id of a user */
	private board = ["", "", "", "", "", "", "", "", ""];

	/** Symbol which this user has, either X or O */
	mySymbol = "";

	/** The move the player made last to serialize the game later */
	private _lastMove = -1;

	private currentPlayer = ""

	constructor(communicationService: CommunicationService, dataService: DataService) {
		super("TikTakToe", dataService, communicationService);
	}

	ngOnInit(): void {
	}

	/**
     * Function updates the internal state of the TikTakToe game.
     * @param  game    The game as a string
     */
	public override updateGameBoard(game: string): void {

		const g = JSON.parse(game);

		this.board = g.board.replace("[", "").replace("]", "").replaceAll(" ", "").split(',');
		this.currentPlayer = g.next_player;
		this.winner = g.winner;
		this.players = [g.player_o, g.player_x];
		if (g.player_o == this.dataService.thisUser.id) {
			this.mySymbol = "O"
		} else if (g.player_x == this.dataService.thisUser.id) {
			this.mySymbol = "X"
		}
		this.actWinner();
	}

	/**
     * Function serializes the game so that it can be interpreted by the backend implementation of the game.
     */
	public override serializeGame(): string {
		var s = {
			name: "TikTakToe",
			player: this.dataService.thisUser.id,
			field: this._lastMove,
		}

		return JSON.stringify(s)
	}

	/** Internal functions to make the UI work **/

	/** @return true if it is this users turn, used in the html */
	get myTurn(): boolean {
		return this.currentPlayer == this.dataService.thisUser.id
	}

	/**
	 * Checks if the user made a valid move. (Field in board is empty)
	 * @param field the id of the field this user clicked in
	 * @returns 
	 */
	isValidMove(field: number): boolean {
		return this.board[field] == "";
	}

	/**
	 * Function is called after the user placed it symbol 
	 * @param f the field the user placed it symbol
	 */
	makeMove(f: number): void {
		this.board[f] = this.dataService.thisUser.id;
		this._lastMove = f;
		this.communicationService.updateGame();
	}

	getField(field: number): string {
		var f = "";
		if (this.board[field] === this.players[0]) {
			return "O"
		} else if (this.board[field] === this.players[1]) {
			return "X";
		} else {
			return "";
		}
	}

	fieldDisabled(field: number): boolean {
		if (!this.myTurn || this.board[field] != "" || this.winner != "") {
			return true;
		}
		return false;
	}

	isOver(): boolean {
		return this.winner !== "";
	}

	partOfTheGame() {
		return this.players.includes(this.dataService.thisUser.id)
	}
}
