import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { BoardComponent } from './components/board/board.component';
import { StartScreenComponent } from "./components/start-screen/start-screen.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'online-game';
  roomCode = "";

  constructor(private _router: Router) {
    this._router.navigate(["login"])
  }
}
