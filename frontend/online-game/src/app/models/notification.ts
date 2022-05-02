export class Notification {
    public message: string;
    public username: string;
    public type: NotificationType;

    constructor(message: string, username: string, type: NotificationType) {
        this.message = message;
        this.username = username;
        this.type = type;
    }
}

export enum NotificationType {
    JOIN,
    LEAVE,
    ASK
}