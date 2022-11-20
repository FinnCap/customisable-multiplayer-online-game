import { User } from "./user";

export class Notification {
    public message: string;
    public user: User;
    public type: NotificationType;
    public error: NotificationError;
    public roomId: string;
    public messageId: string;

    constructor(message: string = "", user: User, type: NotificationType, roomId: string = "", messageId: string = "", error: NotificationError = NotificationError.NONE) {
        this.message = message;
        this.user = user;
        this.type = type;
        this.roomId = roomId
        this.messageId = messageId
        this.error = error;
    }

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

    stringify(): string {
        return JSON.stringify(this, ["message", "user", "username", "id", "color", "roomId", "type", "username", "error", "roomId"])
    }
}

export enum NotificationType {
    NEWROOM,
    JOIN,
    LEAVE,
    ASK,
    ADMITENTRY,
    DENYENTRY,
    CHAT
}

export enum NotificationError {
    NONE,
    NOTEXIST,
    FULL
}