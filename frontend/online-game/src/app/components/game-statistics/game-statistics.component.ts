import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-game-statistics',
  templateUrl: './game-statistics.component.html',
  styleUrls: ['./game-statistics.component.scss']
})

/**
 * Class provides methods needed in the html file to display the complete game statics 
 */
export class GameStatisticsComponent implements OnInit {

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  /**
   * used in html
   * @return all the users order by their points in descending order
   */
  getUsers(): User[] {
    var users = this.dataService.users
    users.sort((a, b) => b.points - a.points)
    return users;
  }

  /** 
   * used in html
   * @param id the id of the user for whom it should be check if it is this user
   * @return true, if the given id belongs to this user
   */
  isThisUser(id: string): boolean {
    return (id == this.dataService.thisUser.id) ? true : false;
  }

}
