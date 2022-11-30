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

/**
 * Class handles the chat window, reads data from the html and provides data to it
 */
export class ChatComponent implements OnInit {

	/** Form for the message */
	messageForm = new FormGroup({
		message: new FormControl("")
	});

	/** Reference to the are with chat messages to automatically scroll to the bottom */
	@ViewChild('chatWindow') private chatScrollContainer: ElementRef;

	constructor(private dataService: DataService, private communicationService: CommunicationService) {
	}


	ngOnInit(): void {
		this.scrollToBottom();
	}

	ngAfterViewChecked(): void {
		this.scrollToBottom();
	}

	/** scrolls the area with the chat messages to the bottom to always view the newest one */
	scrollToBottom(): void {
		try {
			if (this.chatScrollContainer) {
				this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
			}
		} catch (err) {
			console.log(err);
		}
	}

	/**
	 * @return list with all notifications, used in the html
	 */
	getNotifications(): Notification[] {
		return this.dataService.notifications;
	}

	/** 
	 * Called when send button is clicked, gets message from form and call the function in the 
	 * {@link CommunicationService} to send the message to the other users.
	 */
	sendMessage(): void {
		if (this.messageForm.value.message != "") {
			this.communicationService.sendNotification(this.messageForm.value.message);
			this.messageForm.reset();
		}
	}

	/** 
	 * Called when the user admits another user access to the room. The message for this is displayed in the chat.
	 * Calls the function {@link CommunicationService} to send accept.
	 */
	acceptEntry(notification: Notification): void {
		this.dataService.makeNotificationJoin(notification);
		this.communicationService.acceptEntry(notification.user);
	}

	/** 
	 * Called when the user denies another user access to the room. The message for this is displayed in the chat.
	 * Calls the function {@link CommunicationService} to send deny.
	 */
	denyEntry(notification: Notification): void {
		this.dataService.makeNotificationDeny(notification);
		this.communicationService.denyEntry(notification.user);
	}
}
