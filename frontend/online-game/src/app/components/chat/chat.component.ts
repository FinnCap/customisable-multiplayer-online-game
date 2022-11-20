import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Notification } from 'src/app/models/notification';
import { FormControl, FormGroup } from '@angular/forms';
import { CommunicationService } from 'src/app/services/communication.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit {

  messageForm = new FormGroup({
		message: new FormControl("")
	});

  @ViewChild('chatWindow') private myScrollContainer: ElementRef;

  constructor(private dataService: DataService, private communicationService: CommunicationService) {
  }


  ngOnInit(): void { 
    this.scrollToBottom();
  }

  ngAfterViewChecked(): void {        
      this.scrollToBottom();        
  } 

  scrollToBottom(): void {
      try {
          this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch(err) {
      }                 
  }

  getNotifications() {
    return this.dataService.notifications
  }

  sendMessage() {
    if (this.messageForm.value.message != "") {
      this.communicationService.sendNotification(this.messageForm.value.message);
      this.messageForm.reset();
    }
  }

  acceptEntry(notification: Notification): void {
    this.dataService.makeNotificationJoin(notification);
    this.communicationService.acceptEntry(notification.user);
  }

  denyEntry(notification: Notification): void {
    this.dataService.makeNotificationDeny(notification);
    this.communicationService.denyEntry(notification.user);
  }
}
