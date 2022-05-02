import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommunicationService } from 'src/app/services/communication.service';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { RoomError, RoomMessage } from 'src/app/models/room-message';

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

	constructor(private communicationService: CommunicationService, private _router: Router, private dataService: DataService) { }

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
			return;
		}
		this.joinRoomFormSubmitted = false;

		const roomCode = this.joinRoomForm.value.roomCode
		const username = this.joinRoomForm.value.username

		this.communicationService.connect(username, (msg: RoomMessage) => {
			if (msg.error.toString() === RoomError[RoomError.NONE]) {
				this._router.navigate(['/game'], { queryParams: { roomId: msg.roomId } });
			} else if (msg.error.toString() === RoomError[RoomError.NOTEXIST]) {
				this.displayedErrorMessage = "This Room Doesn't Exist,";
			} else if (msg.error.toString() === RoomError[RoomError.FULL]) {
				this.displayedErrorMessage = "The Room Is Full";
			} else if (msg.error.toString() === RoomError[RoomError.NOTPERMITTED]) {
				this.displayedErrorMessage = "You Have Not Been Permitted Entry.";
			} else {
				this.displayedErrorMessage = "An Unknown Error Occured.";
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
			return;
		}
		this.newRoomFormSubmitted = false;
		const username = this.newRoomForm.value.username
		this.communicationService.connect(username, (m: RoomMessage) => {
			this._router.navigate(['/game'], { queryParams: { roomId: m.roomId } });
		});
	}
}
