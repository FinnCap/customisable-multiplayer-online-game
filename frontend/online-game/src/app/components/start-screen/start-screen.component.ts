import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommunicationService } from 'src/app/services/communication.service';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { Notification, NotificationError, NotificationType } from 'src/app/models/notification';

@Component({
	selector: 'app-start-screen',
	templateUrl: './start-screen.component.html',
	styleUrls: ['./start-screen.component.scss']
})

/** This class handles the form for creating a new room and joining a room */
export class StartScreenComponent implements OnInit {

	/** Error Message which is displayed in case a the chosen room can't be joined. */
	displayedErrorMessage = "\n";


	/** Form to create a new Room, contains the username, which is independent from the username in the joinRoomForm */
	newRoomForm = new UntypedFormGroup({
		username: new UntypedFormControl("", [
			Validators.required,
			Validators.minLength(4)
		])
	});
	/** True if the new room form has been submitted and the user is waiting for response, so that not other buttons can be clicked */
	newRoomFormSubmitted = false;

	/** Form to join a Room, containes the username(independent from the username from newRoomForm) */
	joinRoomForm = new UntypedFormGroup({
		roomCode: new UntypedFormControl("", [
			Validators.required,
			Validators.minLength(1)
		]),
		username: new UntypedFormControl("", [
			Validators.required,
			Validators.minLength(4)
		])
	});
	/** True if the join room form has been submitted and the user is waiting for response, so that not other buttons can be clicked */
	joinRoomFormSubmitted = false;

	constructor(private communicationService: CommunicationService, private _router: Router, private dataService: DataService) {

	}

	ngOnInit(): void {
	}

	/**
	 * Return the controls of the join room form, used in the html file
	 */
	get fJ(): { [key: string]: AbstractControl } {
		return this.joinRoomForm.controls;
	}

	/**
	 * Function is called if the user wants to join an existing room.
	 * 1. Checks if the form is valid and displays and error message otherwise.
	 * 2. Calls connect function in {@link communicationService} and provides an
	 * anonymous function to handle the response. Displays error if access not permitted for example
	 * or navigates the user to page for the room
	 */
	joinRoom(): void {
		if (this.joinRoomForm.invalid) {
			if (!this.joinRoomForm.get("username")?.valid) {
				this.displayedErrorMessage = "Please Provide a Username with at Least 4 Characters"
			} else if (!this.joinRoomForm.get("roomCode")?.valid) {
				this.displayedErrorMessage = "Please Provide a Room Code"
			}
			this.joinRoomFormSubmitted = false;
			return;
		}

		this.joinRoomFormSubmitted = true;
		this.displayedErrorMessage = ""
		const roomCode = this.joinRoomForm.value.roomCode
		const username = this.joinRoomForm.value.username

		this.communicationService.connect(username, (msg: Notification) => {
			if (msg.error.toString() === NotificationError[NotificationError.NOTEXIST]) {
				this.displayedErrorMessage = "The Room doesn't Exist.";
				this.joinRoomFormSubmitted = false;
			} else if (msg.type.toString() === NotificationType[NotificationType.ADMITENTRY]) {
				this._router.navigate(['/game'], { queryParams: { roomId: msg.roomId } });
			} else if (msg.type.toString() === NotificationType[NotificationType.DENYENTRY]) {
				this.displayedErrorMessage = "You Have Been Denied the Entry.";
				this.joinRoomFormSubmitted = false;
			} else {
				this.displayedErrorMessage = "An Unknown Error Occurred.";
				this.joinRoomFormSubmitted = false;
			}
		}, roomCode);
	}

	/**
	 * Return the controls of the new room form, used in the html file
	 */
	get fN(): { [key: string]: AbstractControl } {
		return this.newRoomForm.controls;
	}

	/**
	 * Function is called if the user wants to create a new room.
	 * 1. Checks if the form is valid and displays and error message otherwise.
	 * 2. Calls connect function in {@link communicationService} and provides an
	 * anonymous function to handle the response, that navigates the user to page for the room
	 */
	newRoom(): void {
		this.newRoomFormSubmitted = true;
		if (this.newRoomForm.invalid) {
			this.displayedErrorMessage = "Please Provide a Username with at Least 4 Characters"
			this.newRoomFormSubmitted = false;
			return;
		}
		this.newRoomFormSubmitted = true;
		this.displayedErrorMessage = ""
		const username = this.newRoomForm.value.username
		this.communicationService.connect(username, (m: Notification) => {
			this._router.navigate(['/game'], { queryParams: { roomId: m.roomId } });
		});
	}
}
