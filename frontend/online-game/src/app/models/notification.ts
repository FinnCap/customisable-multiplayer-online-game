import { User } from "./user";

export class Notification {

    /** the content of this notification */
    public message: string;

    /** the user associated with this notification */
    public user: User;

    /** type of this notification, for example chat {@link NotificationType} */
    public type: NotificationType;

    /** error value, for example if a room does not exist {@link NotificationError} */
    public error: NotificationError;

    /** The room id of the room this notification came from / is designated to */
    public roomId: string;

    /** The room id of the message to find it again in the list of messages */
    public messageId: string;

    constructor(message: string = "", user: User, type: NotificationType, roomId: string = "", messageId: string = "", error: NotificationError = NotificationError.NONE) {
        this.message = message;
        this.user = user;
        this.type = type;
        this.roomId = roomId
        this.messageId = messageId
        this.error = error;
    }

    // Used by the Chat html to display the message correctly
    isChat() {
        return this.type == NotificationType.CHAT || this.type.toString() === NotificationType[NotificationType.CHAT]
    }

    isAsk() {
        return this.type == NotificationType.ASK || this.type.toString() ===  NotificationType[NotificationType.ASK]
    }

    isJoin() {
        return this.type == NotificationType.JOIN || this.type.toString() ===  NotificationType[NotificationType.JOIN]
    }

    isLeave() {
        return this.type == NotificationType.LEAVE || this.type.toString() ===  NotificationType[NotificationType.LEAVE]
    }

    isWinner() {
        return this.type == NotificationType.WINNER || this.type.toString() ===  NotificationType[NotificationType.WINNER]
    }

    /** @return string representation of the message to sent to the backend */
    stringify(): string {
        return JSON.stringify(this, ["message", "user", "username", "id", "color", "roomId", "type", "username", "error", "roomId"])
    }

    /** @return boolean if two messages are the same */
    equals(n: Notification): boolean {
        return n.message === this.message && n.user.id === this.user.id && n.type === this.type && n.messageId === this.messageId
    }
}

export enum NotificationType {
    NEWROOM, // the user wants to create a new room
    JOIN, // the user associated with this notification joins the room
    LEAVE, // the user associated with this notification leaves the room
    ASK, // the user associated with this notification asks the admin to join the room
    ADMITENTRY, // the user associated with this notification is admitted entry
    DENYENTRY, // the user associated with this notification is denied entry
    CHAT, // the user associated with this notification sent a message to the chat
    WINNER, // Only used in frontend to display the message in chat correctly
}

export enum NotificationError {
    NONE, // no error with this notification
    NOTEXIST // the room the user, associated with this notification, want's to join does not exist
}