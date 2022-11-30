
export class User {
    username: string;
    points: number;
    id: string;
    color: string;
    roomId: string;

    constructor(username: string, id: string, color: string, roomId: string = "", points: number = 0) {
        this.username = username;
        this.id = id;
        this.color = color;
        this.roomId = roomId;
        this.points = points;
    }

    setPoints(points: number) {
        this.points = points;
    }
}