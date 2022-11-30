import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { BoardComponent } from './components/board/board.component';
import { StartScreenComponent } from './components/start-screen/start-screen.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { HttpClientModule } from '@angular/common/http';
import { ChooseGameComponent } from './components/choose-game/choose-game.component';
import { MainScreenComponent } from './components/main-screen/main-screen.component';
import { GameStatisticsComponent } from './components/game-statistics/game-statistics.component';
import { ChatComponent } from './components/chat/chat.component';
import { TikTakToeComponent } from './components/games/tik-tak-toe/tik-tak-toe.component';


@NgModule({
    declarations: [
        AppComponent,
        BoardComponent,
        StartScreenComponent,
        ChooseGameComponent,
        MainScreenComponent,
        GameStatisticsComponent,
        ChatComponent,
        TikTakToeComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        HttpClientModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
