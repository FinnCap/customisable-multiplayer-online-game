import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-game-statistics',
  templateUrl: './game-statistics.component.html',
  styleUrls: ['./game-statistics.component.scss']
})

export class GameStatisticsComponent implements OnInit {

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  getUsers(): User[] {
    var users = this.dataService.users
    users.sort((a, b) => b.points - a.points)
    return users;
  }

  isThisUser(id: string): boolean {
    return (id == this.dataService.thisUser.id) ? true : false;
  }

}
