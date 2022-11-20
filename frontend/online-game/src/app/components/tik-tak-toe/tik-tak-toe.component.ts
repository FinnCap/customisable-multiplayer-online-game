import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Game, IGameSerialized } from 'src/app/models/game';
import { CommunicationService } from 'src/app/services/communication.service';
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/models/user';


interface ITikTakToeSerialized extends IGameSerialized {
  board: string[]
}


@Component({
  selector: 'app-tik-tak-toe',
  templateUrl: './tik-tak-toe.component.html',
  styleUrls: ['./tik-tak-toe.component.scss']
})

export class TikTakToeComponent extends Game implements OnInit {

  board = ["", "", "", "", "", "", "", "", ""];
  mySymbol = ""

  constructor(private communicationService?: CommunicationService, private dataService?: DataService) {
    super("TikTakToe", 2, dataService);
    super.setGameInDataService(this)
  }

  ngOnInit(): void {
  }

  makeMove(f: number) {
    if (this.dataService == null || this.communicationService == null) {
      return
    }
    this.board[f] = this.dataService.thisUser.id;
    var s = {
      name: "TikTakToe",
      player: this.dataService.thisUser.id,
      field: f,
    }
    this.communicationService.updateGame(JSON.stringify(s))
  }

  getField(field: number) {
    var f = ""
    if (this.dataService == null) {
      return ""
    }
    // console.log(this.board[field] == "")
    // console.log(this.board[field] == null)
    // console.log(this.board[field] == '')
    // console.log(typeof this.board)
    // console.log(this.board)
    if (this.board[field] == this.dataService.thisUser.id) {
      f = this.mySymbol
    } else if (this.board[field] != "") {
      f = this.mySymbol == "O" ? "X" : "O"
    } else {
      f = ""
    }
    return f
  }

  fieldDisabled(field: number) {
    if (!this.myTurn || this.board[field] != "" || this.winner != "") {
      return true
    }
    return false
  }

  public isValidMove(field: number): boolean {
    return this.board[field] == ""
  }

  public updateGameBoard(game: string){
    if (this.dataService == null) {
      return
    }
    const g = super.fromJSON(game)
    this.board = g.board
    super.currentPlayer = g.next_player
    super.winner = g.winner
    super.players = [g.player_o, g.player_x]
    this.mySymbol = (g.player_o == this.dataService.thisUser.id) ? "O" : "X"
  }

  public serializeGame(): string {
    var a = {
      name: super.name,
      currentPlayer: super.currentPlayer,
      players: super.players,
      maxPlayers: super.maxPlayers,
      winner: super.winner,
      board: this.board,
    }
    return JSON.stringify(a)
  }

  get myTurn(): boolean {
    if (this.dataService == null) {
      return false
    }
    return super.currentPlayer == this.dataService.thisUser.id
  }

}
