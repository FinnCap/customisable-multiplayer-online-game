import { Component, OnInit } from '@angular/core';
import { GameBoard } from 'src/app/models/game-board';
import { CommunicationService } from 'src/app/services/communication.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-choose-game',
  templateUrl: './choose-game.component.html',
  styleUrls: ['./choose-game.component.scss']
})

export class ChooseGameComponent implements OnInit {

  availableGames: string[] = ["TikTakToe", "Battelships"]

  constructor(private communicationService: CommunicationService, private dataService: DataService) { }

  ngOnInit(): void {
  }

  chooseGame(game: string) {
    this.dataService.currentGameName = game;
    var s = {
      name: game,
      player: "",
      field: 0,
    }
    this.communicationService.chooseGame(JSON.stringify(s));
  }

}
