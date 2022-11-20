import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommunicationService } from 'src/app/services/communication.service';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { Notification, NotificationError, NotificationType } from 'src/app/models/notification';

@Component({
	selector: 'app-start-screen',
	templateUrl: './start-screen.component.html',
	styleUrls: ['./start-screen.component.scss']
})

export class StartScreenComponent implements OnInit {
	// Error Message which is displayed in case a the choosen room can't be joined.
	displayedErrorMessage = "\n";

	// Form to create a new Room, containes the username, which is independent from the username in the joinRoomForm
	newRoomForm = new FormGroup({
		username: new FormControl("", [
			Validators.required,
			Validators.minLength(4)
		])
	});
	newRoomFormSubmitted = false;

	// Form to join a Room, containes the username(independent from the username from newRoomForm)
	joinRoomForm = new FormGroup({
		roomCode: new FormControl("", [
			Validators.required,
			Validators.minLength(10)
		]),
		username: new FormControl("", [
			Validators.required,
			Validators.minLength(4)
		])
	});
	joinRoomFormSubmitted = false;

	constructor(private communicationService: CommunicationService, private _router: Router, private dataService: DataService) {

	}

	ngOnInit(): void { }

	/**
	 * Return the controls of the join room form, used in the start-screen.component.html file
	 */
	get fJ(): { [key: string]: AbstractControl } {
		return this.joinRoomForm.controls;
	}

	joinRoom() {
		this.joinRoomFormSubmitted = true;
		if (this.joinRoomForm.invalid) {
			this.joinRoomFormSubmitted = false;
			return;
		}
		
		const roomCode = this.joinRoomForm.value.roomCode
		const username = this.joinRoomForm.value.username

		this.communicationService.connect(username, (msg: Notification) => {
			if (msg.error.toString() === NotificationError[NotificationError.NOTEXIST]) {
				this.displayedErrorMessage = "The Room Does Not Exist.";
			} else if (msg.error.toString() === NotificationError[NotificationError.FULL]) {
				this.displayedErrorMessage = "The Room is Full.";
			} else if (msg.type.toString() === NotificationType[NotificationType.ADMITENTRY]) {
				this._router.navigate(['/game'], { queryParams: { roomId: msg.roomId } });
			} else if (msg.type.toString() === NotificationType[NotificationType.DENYENTRY]) {
				this.displayedErrorMessage = "You Have Been Denied The Entry.";
			} else {
				this.displayedErrorMessage = "An Unknown Error Occurred.";
			}
		}, roomCode);
	}

	/**
	 * Return the controls of the new room form, used in the start-screen.component.html file
	 */
	get fN(): { [key: string]: AbstractControl } {
		return this.newRoomForm.controls;
	}

	newRoom() {
		this.newRoomFormSubmitted = true;
		if (this.newRoomForm.invalid) {
			this.newRoomFormSubmitted = false;
			return;
		}
		const username = this.newRoomForm.value.username
		this.communicationService.connect(username, (m: Notification) => {
			this._router.navigate(['/game'], { queryParams: { roomId: m.roomId } });
		});
	}

	newRoomButtonDisabled(): boolean {
		return this.newRoomFormSubmitted
	}

	joinRoomButtonDisabled(): boolean {
		return this.joinRoomFormSubmitted
	}
}
