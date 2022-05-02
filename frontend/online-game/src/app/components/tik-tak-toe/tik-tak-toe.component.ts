import { Component, OnInit } from '@angular/core';
import { Game } from 'src/app/models/game';
import { CommunicationService } from 'src/app/services/communication.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-tik-tak-toe',
  templateUrl: './tik-tak-toe.component.html',
  styleUrls: ['./tik-tak-toe.component.scss']
})
export class TikTakToeComponent extends Game implements OnInit {

  fields = ["", "", "", "", "", "", "", "", ""];
  myTurn = true;
  mySymbol = ""

  constructor(private communicationService: CommunicationService, private dataService: DataService) {
    super();
    dataService.currentGame = this;
    this.mySymbol = "uhbvefjdnk"
  }

  ngOnInit(): void {
  }

  makeMove(f: number) {
    this.fields[f] = this.dataService.thisUser.id;

    // var s = new Map<string, string>();
    // s.set("field", String(f));
    var s = {
      name: "TikTakToe",
      player: this.dataService.thisUser.id,
      field: f,
    }
    this.communicationService.updateGame(JSON.stringify(s))
  }

  getField(field: number) {
    if (this.fields[field] == this.dataService.thisUser.id) {
      return this.mySymbol
    } else if (this.fields[field] != "") {
      return this.mySymbol == "O" ? "X" : "O"
    } else {
      return ""
    }
  }

  fieldDisabled(field: number) {
    if (!this.myTurn || this.fields[field] != "") {
      return true
    }
    return false
  }

}
